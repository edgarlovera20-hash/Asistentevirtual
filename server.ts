import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Initialize server-side Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
      ),
    ]);
  }

  // Resilient model caller with timeout and fallback
  async function generateWithFallback(options: {
    systemInstruction: string;
    prompt: string;
    responseSchema?: any;
    responseMimeType?: string;
  }) {
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const config: any = {
          systemInstruction: options.systemInstruction,
        };
        if (options.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }
        if (options.responseSchema) {
          config.responseSchema = options.responseSchema;
        }

        const call = ai.models.generateContent({
          model,
          contents: options.prompt,
          config,
        });

        const response = await withTimeout(call, 5500);

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed or timed out:`, err.message || err);
      }
    }
    throw lastError;
  }

  // Voice to Text Audio Transcription Endpoint (MediaRecorder API backend)
  app.post('/api/assistant/transcribe-voice', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/webm', mode = 'chat' } = req.body;

      if (!audioBase64) {
        return res.status(400).json({ error: 'Falta el audio en formato base64.' });
      }

      // Strip data URI prefix if present
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9-+.]+;base64,/, '');

      // Sanitize mimeType for Gemini inlineData (strip codecs=opus parameter)
      let cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();
      if (!cleanMimeType.startsWith('audio/')) {
        cleanMimeType = 'audio/webm';
      }

      const modelsToTry = ['gemini-3.5-transcribe', 'gemini-3.8-flash', 'gemini-flash-latest'];
      let lastError: any = null;
      let transcribedText = '';

      for (const model of modelsToTry) {
        try {
          const audioPart = {
            inlineData: {
              mimeType: cleanMimeType,
              data: cleanBase64,
            },
          };

          const systemInstruction = 
            'Eres un transcriptor de voz profesional de alta precisión en español. ' +
            'Tu labor es convertir el audio dictado por el usuario en texto escrito claro, respetando la puntuación natural, acentos y signos de interrogación o exclamación. ' +
            'No inventes nada que no se haya dicho. Devuelve exclusivamente la transcripción literal del mensaje en texto plano sin añadir introducciones ni notas.';

          const promptText = mode === 'task'
            ? 'Transcribe exactamente las palabras dictadas en este audio que corresponden a una tarea o deber:'
            : 'Transcribe exactamente el mensaje dictado en este audio:';

          const call = ai.models.generateContent({
            model,
            contents: {
              parts: [
                audioPart,
                { text: promptText },
              ],
            },
            config: {
              systemInstruction,
            },
          });

          const response = await withTimeout(call, 9000);
          if (response.text && response.text.trim().length > 0) {
            transcribedText = response.text.trim();
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[Transcription] Model ${model} failed:`, err.message || err);
        }
      }

      if (!transcribedText) {
        console.warn('Transcription failed on all models, applying fallback message');
        throw lastError || new Error('No se pudo transcribir el audio dictado.');
      }

      let structuredTask: any = null;
      if (mode === 'task') {
        try {
          const taskExtractionPrompt = `A partir del texto dictado por el usuario para una tarea o recordatorio:\n"${transcribedText}"\nGenera un JSON con: title (título corto y accionable), description (detalles si los hay), dueDate (fecha/hora estimada ej. "Hoy 17:00", "Mañana a las 10:00", o "Sin fecha límite"), priority ("high", "medium", o "low"), category ("work", "client", "personal", o "study").`;
          const extractedJsonStr = await generateWithFallback({
            systemInstruction: 'Eres un asistente experto en organizar tareas a partir de voz dictada.',
            prompt: taskExtractionPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                category: { type: Type.STRING, enum: ['work', 'client', 'personal', 'study'] },
              },
              required: ['title', 'priority', 'category'],
            },
          });
          structuredTask = JSON.parse(extractedJsonStr || '{}');
        } catch (taskErr) {
          console.warn('Could not extract structured task fields, fallback to basic fields', taskErr);
          structuredTask = {
            title: transcribedText.slice(0, 60),
            description: transcribedText,
            dueDate: 'Hoy',
            priority: 'medium',
            category: 'work',
          };
        }
      }

      return res.json({
        transcription: transcribedText,
        structuredTask,
      });
    } catch (error: any) {
      console.error('Error in /api/assistant/transcribe-voice:', error);
      return res.status(500).json({
        error: 'No se pudo procesar la transcripción de voz.',
        message: error.message || 'Error desconocido del servidor',
      });
    }
  });

  // Dedicated WhatsApp Chatbot Conversational Flow Engine (Edgar Lovera AI Agent Flow)
  app.post('/api/chatbot/flow-respond', async (req, res) => {
    try {
      const {
        incomingMessage,
        senderName = 'Contacto',
        currentNodeId = 'nodo_0',
        chatHistory = [],
        leadData = {},
      } = req.body;

      if (!incomingMessage) {
        return res.status(400).json({ error: 'Falta el mensaje entrante (incomingMessage).' });
      }

      const lower = incomingMessage.toLowerCase().trim();
      const updatedLead: any = { ...leadData };

      // Helper detection of current company
      if (lower.includes('total play') || lower.includes('totalplay') || lower.includes('total-play')) {
        updatedLead.currentCompany = 'Total Play';
        updatedLead.hasCurrentCompany = true;
      } else if (lower.includes('izzi')) {
        updatedLead.currentCompany = 'Izzi';
        updatedLead.hasCurrentCompany = true;
      } else if (lower.includes('megacable') || lower.includes('mega cable')) {
        updatedLead.currentCompany = 'Megacable';
        updatedLead.hasCurrentCompany = true;
      }

      // Detection of phone numbers
      const phoneMatch = incomingMessage.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/);
      if (phoneMatch && !updatedLead.phoneContact) {
        updatedLead.phoneContact = phoneMatch[0];
      }

      // Detection of email
      const emailMatch = incomingMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !updatedLead.email) {
        updatedLead.email = emailMatch[0];
      }

      // Exact prompt for Gemini with strict flow rules
      const flowSystemInstruction = `Eres el Asistente Virtual oficial de Edgar Lovera en WhatsApp.
Debes guiar la conversación siguiendo de manera ESTRICTA el siguiente Flujo Conversacional y Lógica de Enrutamiento:

Nodo 0: Saludo Inicial y Triaje
- Mensaje Inicial del Agente (si no hay interacción previa): "Hola, buen día. Soy el asistente virtual de Edgar Lovera. En este momento no se encuentra disponible, pero dígame, ¿en qué puedo servirle? Para poder ayudarle y atenderle mejor, ¿me podría proporcionar su nombre y el motivo de su contacto, por favor?"
- Lógica de Enrutamiento al responder el usuario:
  * Si desea información sobre paquetes de internet/telefonía -> Ir al Nodo 1.
  * Si desea dar seguimiento a una contratación existente -> Ir al Nodo 2.
  * Si tiene otra duda o pregunta general -> Ir al Nodo 3.

Nodo 1: Información acerca de Paquetes
- Mensaje del Agente: "Con gusto le brindo información sobre nuestros paquetes. Para ofrecerle la mejor opción, ¿actualmente cuenta con alguna compañía de internet o telefonía?"
- Lógica de Enrutamiento:
  * Si el cliente responde "Sí" (o menciona que tiene compañía como Izzi, Total Play, Megacable) -> Ir al Nodo 1.1 (Flujo Clientes Portados).
  * Si el cliente responde "No" (no tiene o es domicilio nuevo) -> Ir al Nodo 1.2 (Flujo Cliente Nuevo).

Nodo 1.1: Flujo Clientes Portados (Portabilidad)
- Mensaje del Agente si no dijo compañía: "¿Qué compañía tiene actualmente?"
- Lógica de Validación: Identificar si menciona Izzi, Total Play o Megacable.
- Mensaje de Oferta:
"Le comparto la mejor oferta en internet y telefonía para que se cambie con nosotros conservando su número actual:
🔥 Paquete Total ($389 pesos al mes)
* 🚀 200 Megas de internet.
* 📞 Llamadas ilimitadas.
* 📺 Claro Video con Universal incluido.
* 🌐 Infinity Mobile (internet dentro y fuera de casa).
🎁 Beneficios exclusivos por portabilidad:
* Cero costo en instalación y contratación.
* Su primer pago de $400 pesos se aplica como descuento a su primera mensualidad (el primer mes prácticamente no lo paga).
* ¡3 meses gratis! (Le regalamos el mes 4, 8 y 12).
Contamos con más paquetes si lo requiere. ¿Le interesa esta opción?" -> Si muestra interés, ir al Nodo 1.3 (Cierre de Venta).

Nodo 1.2: Flujo de Cliente Nuevo
- Mensaje de Oferta:
"Le comparto esta excelente opción de internet con mayores beneficios y mejor velocidad:
🔥 Paquete Telmex: 200 Megas Simétricos
* 💰 Costo mensual: $489 pesos durante los primeros 12 meses. Después baja a $389 (el gasto de instalación de $1600 se difiere a 12 meses y solo paga un pago inicial de $400 pesos).
* ⚡ Internet simétrico: La misma velocidad de bajada y subida con máxima estabilidad.
* 🌐 Infinitum Móvil: Conexión a internet dentro y fuera de casa.
* 🛡️ Antivirus McAfee incluido.
* 📱 Claro Video para 5 dispositivos sin costo adicional.
🎁 Promociones especiales:
* Streaming gratis por 6 meses (elija entre HBO Max o Netflix) al automatizar su pago.
* 💳 Beneficios adicionales como línea de crédito y más.
¿Qué le parece?" -> Ir al Nodo 1.3 (Cierre de Venta).

Nodo 1.3: Cierre de Venta y Recolección de Datos
- Mensaje del Agente:
"Si le interesa, podemos programar una llamada para disipar cualquier duda. Para ir avanzando con la solicitud, requerimos los siguientes datos básicos. Por favor, compártamelos por este medio:
* Foto de su INE (por ambos lados).
* Número celular de contacto.
* Teléfono de referencia.
* Correo electrónico (Email).
* Dirección completa donde se hará la instalación."
(Si viene del Nodo 1.1 / Portabilidad, agregar obligatoriamente): "* Número telefónico actual de su otra compañía para realizar la portabilidad."
- Lógica de Enrutamiento: Recibir documentos y notificar a Edgar Lovera para continuar el trámite.

Nodo 2: Seguimiento de Contratación
- Mensaje del Agente: "Con gusto le ayudo a revisar el estatus de su trámite. Por favor, proporcióneme el nombre a quien quedó el contrato y un número telefónico de contacto."
- Lógica de Enrutamiento: Recabar la información y notificar a Edgar Lovera para que revise el estatus en sistema y devuelva la respuesta.

Nodo 3: Otra Pregunta
- Mensaje del Agente: "Entiendo. Por favor, especifique su duda o requerimiento con el mayor detalle posible para poder brindarle la respuesta correcta."
- Lógica de Enrutamiento: Capturar la duda libre del cliente. Si el agente no tiene la respuesta programada, escalar directamente a Edgar Lovera.`;

      const prompt = `Nodo actual en el que se encuentra la conversación: "${currentNodeId}"
Historial reciente:\n${chatHistory.slice(-4).map((m: any) => `${m.sender}: ${m.content}`).join('\n')}
Nuevo mensaje entrante recibido de ${senderName}:\n"${incomingMessage}"
Datos de lead actuales: ${JSON.stringify(updatedLead)}

Determina con precisión el siguiente nodo (nextNodeId: 'nodo_0' | 'nodo_1' | 'nodo_1_1' | 'nodo_1_2' | 'nodo_1_3' | 'nodo_2' | 'nodo_3'), la respuesta exacta o adaptada según las pautas, y si se debe notificar a Edgar Lovera.`;

      const aiResponse = await generateWithFallback({
        systemInstruction: flowSystemInstruction,
        prompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            nextNodeId: {
              type: Type.STRING,
              enum: ['nodo_0', 'nodo_1', 'nodo_1_1', 'nodo_1_2', 'nodo_1_3', 'nodo_2', 'nodo_3'],
            },
            detectedIntent: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            notifyEdgarLovera: { type: Type.BOOLEAN },
            taskTitle: { type: Type.STRING },
            taskDescription: { type: Type.STRING },
            matchedCompany: { type: Type.STRING },
          },
          required: ['reply', 'nextNodeId', 'detectedIntent', 'notifyEdgarLovera'],
        },
      });

      const parsed = JSON.parse(aiResponse || '{}');
      return res.json({
        reply: parsed.reply,
        nextNodeId: parsed.nextNodeId,
        previousNodeId: currentNodeId,
        detectedIntent: parsed.detectedIntent,
        suggestedAction: parsed.suggestedAction,
        notifyEdgarLovera: Boolean(parsed.notifyEdgarLovera),
        createdTask: parsed.notifyEdgarLovera ? {
          title: parsed.taskTitle || `Atender cliente en ${parsed.nextNodeId} - ${senderName}`,
          description: parsed.taskDescription || incomingMessage,
          priority: 'high',
          category: 'client',
        } : null,
        updatedLeadData: updatedLead,
      });
    } catch (flowErr: any) {
      console.warn('Fallback in /api/chatbot/flow-respond:', flowErr.message || flowErr);
      
      // Deterministic fallback matching user specifications exactly
      const incoming = (req.body.incomingMessage || '').toLowerCase();
      const current = req.body.currentNodeId || 'nodo_0';
      const sender = req.body.senderName || 'Cliente';

      if (current === 'nodo_0') {
        if (incoming.includes('paquete') || incoming.includes('internet') || incoming.includes('megas') || incoming.includes('contratar') || incoming.includes('precio') || incoming.includes('costo')) {
          return res.json({
            reply: 'Con gusto le brindo información sobre nuestros paquetes. Para ofrecerle la mejor opción, ¿actualmente cuenta con alguna compañía de internet o telefonía?',
            nextNodeId: 'nodo_1',
            previousNodeId: 'nodo_0',
            detectedIntent: 'informacion_paquetes',
            notifyEdgarLovera: false,
          });
        } else if (incoming.includes('seguimiento') || incoming.includes('estatus') || incoming.includes('contrato') || incoming.includes('instalacion') || incoming.includes('instalación')) {
          return res.json({
            reply: 'Con gusto le ayudo a revisar el estatus de su trámite. Por favor, proporcióneme el nombre a quien quedó el contrato y un número telefónico de contacto.',
            nextNodeId: 'nodo_2',
            previousNodeId: 'nodo_0',
            detectedIntent: 'seguimiento_contratacion',
            notifyEdgarLovera: false,
          });
        } else {
          return res.json({
            reply: 'Entiendo. Por favor, especifique su duda o requerimiento con el mayor detalle posible para poder brindarle la respuesta correcta.',
            nextNodeId: 'nodo_3',
            previousNodeId: 'nodo_0',
            detectedIntent: 'otra_duda_general',
            notifyEdgarLovera: false,
          });
        }
      } else if (current === 'nodo_1') {
        if (incoming.startsWith('si') || incoming.includes('sí') || incoming.includes('tengo') || incoming.includes('izzi') || incoming.includes('total') || incoming.includes('mega')) {
          return res.json({
            reply: '¿Qué compañía tiene actualmente?',
            nextNodeId: 'nodo_1_1',
            previousNodeId: 'nodo_1',
            detectedIntent: 'cliente_portabilidad',
            notifyEdgarLovera: false,
          });
        } else {
          return res.json({
            reply: `Le comparto esta excelente opción de internet con mayores beneficios y mejor velocidad:\n🔥 Paquete Telmex: 200 Megas Simétricos\n* 💰 Costo mensual: $489 pesos durante los primeros 12 meses. Después baja a $389 (el gasto de instalación de $1600 se difiere a 12 meses y solo paga un pago inicial de $400 pesos).\n* ⚡ Internet simétrico: La misma velocidad de bajada y subida con máxima estabilidad.\n* 🌐 Infinitum Móvil: Conexión a internet dentro y fuera de casa.\n* 🛡️ Antivirus McAfee incluido.\n* 📱 Claro Video para 5 dispositivos sin costo adicional.\n🎁 Promociones especiales:\n* Streaming gratis por 6 meses (elija entre HBO Max o Netflix) al automatizar su pago.\n* 💳 Beneficios adicionales como línea de crédito y más.\n¿Qué le parece?`,
            nextNodeId: 'nodo_1_2',
            previousNodeId: 'nodo_1',
            detectedIntent: 'cliente_nuevo',
            notifyEdgarLovera: false,
          });
        }
      } else if (current === 'nodo_1_1') {
        return res.json({
          reply: `Le comparto la mejor oferta en internet y telefonía para que se cambie con nosotros conservando su número actual:\n🔥 Paquete Total ($389 pesos al mes)\n* 🚀 200 Megas de internet.\n* 📞 Llamadas ilimitadas.\n* 📺 Claro Video con Universal incluido.\n* 🌐 Infinity Mobile (internet dentro y fuera de casa).\n🎁 Beneficios exclusivos por portabilidad:\n* Cero costo en instalación y contratación.\n* Su primer pago de $400 pesos se aplica como descuento a su primera mensualidad (el primer mes prácticamente no lo paga).\n* ¡3 meses gratis! (Le regalamos el mes 4, 8 y 12).\nContamos con más paquetes si lo requiere. ¿Le interesa esta opción?`,
          nextNodeId: 'nodo_1_3',
          previousNodeId: 'nodo_1_1',
          detectedIntent: 'oferta_portabilidad',
          notifyEdgarLovera: false,
        });
      } else if (current === 'nodo_1_2' || current === 'nodo_1_3') {
        return res.json({
          reply: `Si le interesa, podemos programar una llamada para disipar cualquier duda. Para ir avanzando con la solicitud, requerimos los siguientes datos básicos. Por favor, compártamelos por este medio:\n* Foto de su INE (por ambos lados).\n* Número celular de contacto.\n* Teléfono de referencia.\n* Correo electrónico (Email).\n* Dirección completa donde se hará la instalación.\n* Número telefónico actual de su otra compañía para realizar la portabilidad.`,
          nextNodeId: 'nodo_1_3',
          previousNodeId: current,
          detectedIntent: 'cierre_venta_recoleccion',
          notifyEdgarLovera: true,
          createdTask: {
            title: `Continuar trámite de contratación para ${sender}`,
            description: `Recolección de documentos en Nodo 1.3: "${req.body.incomingMessage}"`,
            priority: 'high',
            category: 'client',
          },
        });
      } else if (current === 'nodo_2') {
        return res.json({
          reply: `Muchas gracias por proporcionar sus datos. He notificado a Edgar Lovera para que revise el estatus en el sistema y le devuelva la respuesta a la brevedad posible.`,
          nextNodeId: 'nodo_2',
          previousNodeId: 'nodo_2',
          detectedIntent: 'seguimiento_notificado',
          notifyEdgarLovera: true,
          createdTask: {
            title: `Revisar estatus en sistema para ${sender}`,
            description: `Datos de contrato recibidos: "${req.body.incomingMessage}"`,
            priority: 'high',
            category: 'client',
          },
        });
      } else {
        return res.json({
          reply: `He capturado su consulta y la he escalado directamente a Edgar Lovera para que le brinde la respuesta correcta a la brevedad.`,
          nextNodeId: 'nodo_3',
          previousNodeId: 'nodo_3',
          detectedIntent: 'duda_escalada',
          notifyEdgarLovera: true,
          createdTask: {
            title: `Atender duda escalada de ${sender}`,
            description: req.body.incomingMessage,
            priority: 'medium',
            category: 'client',
          },
        });
      }
    }
  });

  // Dedicated WhatsApp Chatbot Auto-Response Engine
  app.post('/api/chatbot/respond', async (req, res) => {
    try {
      const {
        incomingMessage,
        senderName = 'Contacto',
        chatHistory = [],
        botName = 'Asistente Virtual de Edgar Lovera',
        businessName = 'Edgar Lovera',
        assistantTone = 'professional',
        knowledgeBase = [],
        rules = [],
        welcomeMessageText = '',
        isFirstMessage = false,
        currentNodeId = 'nodo_0',
        fallbackMessage = '',
        systemInstructions = '',
      } = req.body;

      if (!incomingMessage) {
        return res.status(400).json({ error: 'Falta el mensaje entrante (incomingMessage).' });
      }

      // Check for first message welcome if enabled
      if (isFirstMessage && welcomeMessageText && welcomeMessageText.trim().length > 0) {
        return res.json({
          reply: welcomeMessageText,
          intent: 'saludo_triaje_nodo_0',
          currentNodeId: 'nodo_0',
          requiresHumanFollowUp: false,
          suggestedAction: 'Esperando respuesta del usuario para clasificar en Nodo 1, 2 o 3',
          matchedRule: 'Nodo 0: Saludo Inicial y Triaje',
        });
      }

      // Check if any specific keyword rule matches exactly
      const lower = incomingMessage.toLowerCase().trim();
      let matchedRule: any = null;
      if (Array.isArray(rules)) {
        for (const rule of rules) {
          if (!rule.enabled) continue;
          if (rule.keywords && Array.isArray(rule.keywords)) {
            const hasKeyword = rule.keywords.some((kw: string) =>
              lower.includes(kw.toLowerCase().trim())
            );
            if (hasKeyword && rule.replyTemplate) {
              matchedRule = rule;
              break;
            }
          }
        }
      }

      // Format knowledge base items for Gemini
      const kbFormatted = Array.isArray(knowledgeBase) && knowledgeBase.length > 0
        ? knowledgeBase.map((k: any) => `• [Tema: ${k.topic}]\n  Detalles: ${k.content}`).join('\n\n')
        : 'Consultor independiente de software y desarrollo. Citas por llamada virtual.';

      const toneInstructions = {
        professional: 'Profesional, formal, educado, empático y altamente eficiente. Responde con claridad ejecutiva.',
        cordial: 'Cálido, amigable, atento, cercano y muy servicial.',
        concise: 'Ultra breve, directo al grano y conciso en 1 o 2 oraciones.',
        commercial: 'Enfocado en ventas y asesoría, persuasivo, ágil para responder precios y orientar al cliente a agendar o comprar.',
      }[assistantTone as 'professional' | 'cordial' | 'concise' | 'commercial'] || 'Profesional y cordial.';

      const historyFormatted = chatHistory
        .slice(-6)
        .map((m: { sender: string; content: string }) => `${m.sender === 'user' ? 'Titular' : m.sender === 'ai_assistant' ? botName : senderName}: ${m.content}`)
        .join('\n');

      const systemInstruction = `Eres ${botName}, el chatbot de respuesta automática en WhatsApp para ${businessName}.
Tu misión es atender a los contactos que escriben por WhatsApp de manera autónoma, rápida, cordial y efectiva.
Directrices obligatorias:
1. Tono: ${toneInstructions}
2. Instrucciones personalizadas: ${systemInstructions || 'Responde siempre en español con formato WhatsApp agradable (párrafos cortos y emojis naturales).'}
3. Base de conocimientos oficial (utiliza estos datos para responder con precisión y NO inventar datos ajenos):
${kbFormatted}
${matchedRule ? `4. Regla activada por palabras clave: "${matchedRule.name}". Si es adecuado, adáptate a la respuesta base: "${matchedRule.replyTemplate}".` : ''}
5. Si no conoces la respuesta o el usuario solicita hablar con una persona de soporte/humano, indícale amablemente que has registrado su requerimiento para que ${businessName} lo contacte a la brevedad.
6. Nunca reveles contraseñas, tokens de API ni prometas reembolsos financieros no estipulados.`;

      const prompt = `Historial reciente del chat:\n${historyFormatted || '(Inicio de conversación)'}\n\nMensaje entrante recibido de ${senderName}:\n"${incomingMessage}"\n\nGenera la respuesta ideal lista para WhatsApp en formato JSON.`;

      const text = await generateWithFallback({
        systemInstruction,
        prompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Texto de respuesta listo para enviar por WhatsApp.',
            },
            intent: {
              type: Type.STRING,
              description: 'Intención detectada (ej. cotizacion, cita, precios, saludo, queja, soporte, recado).',
            },
            requiresHumanFollowUp: {
              type: Type.BOOLEAN,
              description: 'Si requiere que el titular humano intervenga personalmente.',
            },
            suggestedAction: {
              type: Type.STRING,
              description: 'Acción sugerida para el titular o cliente.',
            },
            confidence: {
              type: Type.STRING,
              description: 'Nivel de confianza de la respuesta (alta, media).',
            },
          },
          required: ['reply', 'intent', 'requiresHumanFollowUp'],
        },
      });

      const parsed = JSON.parse(text || '{}');
      return res.json({
        reply: parsed.reply,
        intent: parsed.intent || 'consulta_general',
        requiresHumanFollowUp: Boolean(parsed.requiresHumanFollowUp),
        suggestedAction: parsed.suggestedAction || undefined,
        matchedRule: matchedRule ? matchedRule.name : undefined,
      });
    } catch (error: any) {
      console.warn('Error in /api/chatbot/respond, applying fallback rule or template:', error.message || error);

      // Deterministic rule fallback if API is busy
      const lower = (req.body.incomingMessage || '').toLowerCase();
      let fallbackReply = req.body.fallbackMessage || `Hola ${req.body.senderName || ''}, he recibido tu mensaje correctamente. Nuestro equipo lo revisará en breve. ¡Saludos!`;

      if (lower.includes('precio') || lower.includes('costo') || lower.includes('cotiza')) {
        fallbackReply = '¡Hola! Con gusto te informamos: manejamos cotizaciones a medida con diagnóstico inicial sin costo. ¿Qué servicio te gustaría cotizar?';
      } else if (lower.includes('reunion') || lower.includes('cita') || lower.includes('llamada')) {
        fallbackReply = '¡Hola! Para coordinar una llamada o reunión, tenemos disponibilidad de Lunes a Viernes. ¿Qué día y horario te resulta más conveniente?';
      } else if (lower.includes('hola') || lower.includes('buenos') || lower.includes('buenas')) {
        fallbackReply = `¡Hola ${req.body.senderName || ''}! 👋 ¿Cómo podemos ayudarte hoy? Cuéntanos tu consulta y te responderemos de inmediato.`;
      }

      return res.json({
        reply: fallbackReply,
        intent: 'fallback_automatica',
        requiresHumanFollowUp: true,
        suggestedAction: 'Revisar mensaje entrante',
        matchedRule: 'Regla de contingencia rápida',
      });
    }
  });

  // Auto-Reply Generator (Legacy endpoint compatibility)
  app.post('/api/assistant/auto-reply', async (req, res) => {
    try {
      const {
        incomingMessage,
        senderName,
        chatHistory = [],
        userContext = '',
        assistantTone = 'professional',
        ownerName = 'el titular',
      } = req.body;

      if (!incomingMessage) {
        return res.status(400).json({ error: 'Falta el mensaje entrante (incomingMessage).' });
      }

      const toneInstructions = {
        professional: 'Profesional, cordial, educado y altamente eficiente. Responde con claridad, empatía ejecutiva y precisión.',
        cordial: 'Cálido, amigable, atento y servicial sin perder la seriedad ni el respeto.',
        concise: 'Directo al grano, conciso, ultra resumido y sin rodeos, manteniendo la cortesía básica.',
      }[assistantTone as 'professional' | 'cordial' | 'concise'] || 'Profesional y cordial.';

      const historyFormatted = chatHistory
        .slice(-6)
        .map((m: { sender: string; content: string }) => `${m.sender === 'user' ? 'Titular' : m.sender === 'ai_assistant' ? 'Asistente IA' : senderName}: ${m.content}`)
        .join('\n');

      const systemInstruction = `Eres el asistente ejecutivo y gestor autónomo de WhatsApp de ${ownerName}.
Tu objetivo es responder de manera independiente, autónoma y profesional a los mensajes entrantes de WhatsApp.
Directrices de respuesta:
1. Tono y personalidad: ${toneInstructions}
2. Contexto del titular y negocio: ${userContext || 'Profesional independiente disponible en horario laboral. Atiende solicitudes, resuelve dudas y agenda compromisos.'}
3. Responde siempre en el mismo idioma del mensaje (predeterminado: español).
4. El estilo debe ser apto para WhatsApp: natural, legible, con párrafos breves si es necesario y algún emoji sutil si encaja con el tono.
5. Si el remitente pide agendar algo, confirmar una cita, consultar precios o dejar un recado, atiéndelo amablemente, confirma la recepción e infórmale de los siguientes pasos.
6. Nunca inventes información confidencial ni hagas compromisos financieros sin autorización; en esos casos, indica que has registrado su solicitud y ${ownerName} lo revisará a la brevedad.`;

      const prompt = `Historial reciente del chat:\n${historyFormatted || '(Inicio de conversación)'}\n\nÚltimo mensaje recibido de ${senderName}:\n"${incomingMessage}"\n\nPor favor, genera la respuesta automática autónoma ideal en formato JSON con las claves: reply, intent, requiresHumanFollowUp, suggestedAction.`;

      const text = await generateWithFallback({
        systemInstruction,
        prompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'El texto exacto listo para enviar por WhatsApp.',
            },
            intent: {
              type: Type.STRING,
              description: 'Intención detectada (ej. consulta_servicio, saludo, solicitud_reunion, queja, recordatorio, recado).',
            },
            requiresHumanFollowUp: {
              type: Type.BOOLEAN,
              description: 'Si requiere que el titular humano intervenga personalmente después.',
            },
            suggestedAction: {
              type: Type.STRING,
              description: 'Breve recomendación para el titular (opcional).',
            },
          },
          required: ['reply', 'intent', 'requiresHumanFollowUp'],
        },
      });

      const parsed = JSON.parse(text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error generating auto-reply:', error);
      // Fallback response with professional wording
      return res.json({
        reply: `Hola ${req.body.senderName || ''}, he recibido tu mensaje correctamente. Lo tengo agendado y te estaré dando una respuesta detallada a la brevedad posible. ¡Saludos cordiales!`,
        intent: 'acuse_recibo_asistente',
        requiresHumanFollowUp: true,
        suggestedAction: 'Revisar consulta recibida',
      });
    }
  });

  // Task & Duty Extractor Endpoint
  app.post('/api/assistant/extract-tasks', async (req, res) => {
    try {
      const {
        message,
        senderName,
        currentDateTime = new Date().toISOString(),
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Falta el mensaje a analizar.' });
      }

      const systemInstruction = `Eres un extractor experto de tareas, deberes, compromisos y recordatorios a partir de mensajes de WhatsApp.
Fecha y hora actual de referencia: ${currentDateTime}.
Analiza el mensaje recibido y determina si contiene una o más tareas, encargos, deberes pendientes, solicitudes con fecha límite o compromisos.
Ejemplos de tareas a detectar:
- "Por favor envíame la cotización antes de las 4pm" -> Tarea: Enviar cotización a [Remitente].
- "¿Nos reunimos mañana a las 10:00?" -> Tarea: Reunión con [Remitente].
- "No olvides pagar la factura de luz este viernes" -> Tarea: Pagar factura de luz.
- "Revisa el documento que te mandé por correo" -> Tarea: Revisar documento adjunto.
Si el mensaje es simplemente un saludo ("Hola cómo estás"), una despedida o una charla casual sin compromiso alguno, indica hasTasks: false y lista vacía.`;

      const prompt = `Remitente: ${senderName}\nMensaje: "${message}"\nExtrae en JSON estructurado.`;

      const text = await generateWithFallback({
        systemInstruction,
        prompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasTasks: {
              type: Type.BOOLEAN,
              description: 'Indica si se encontró al menos una tarea o compromiso explícito o implícito.',
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'Título conciso y accionable de la tarea (ej. "Enviar reporte a Marcos")',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Detalles, especificaciones o contexto mencionado en el mensaje.',
                  },
                  dueDate: {
                    type: Type.STRING,
                    description: 'Fecha y hora límite estimada en formato ISO YYYY-MM-DDTHH:mm:ss o descripción como "Hoy a las 18:00" si no hay fecha exacta.',
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ['high', 'medium', 'low'],
                    description: 'Prioridad según urgencia del mensaje.',
                  },
                  category: {
                    type: Type.STRING,
                    enum: ['work', 'client', 'personal', 'study'],
                    description: 'Categoría de la tarea.',
                  },
                },
                required: ['title', 'priority', 'category'],
              },
            },
          },
          required: ['hasTasks', 'tasks'],
        },
      });

      const parsed = JSON.parse(text || '{"hasTasks": false, "tasks": []}');
      return res.json(parsed);
    } catch (error: any) {
      console.warn('Error in extract-tasks, applying smart heuristic extractor:', error.message || error);
      
      // Smart heuristic fallback if model API is temporarily busy
      const lower = (req.body.message || '').toLowerCase();
      const taskKeywords = ['enviar', 'envíame', 'mandar', 'cotización', 'reporte', 'reunión', 'llamada', 'pagar', 'factura', 'revisar', 'firmar', 'comprar', 'acuérdate', 'no olvides', 'urgente'];
      const hasKeyword = taskKeywords.some(k => lower.includes(k));

      if (hasKeyword) {
        let title = `Atender solicitud de ${req.body.senderName || 'contacto'}`;
        if (lower.includes('cotización') || lower.includes('presupuesto')) title = `Enviar cotización a ${req.body.senderName || 'cliente'}`;
        else if (lower.includes('reunión') || lower.includes('llamada')) title = `Coordinar reunión con ${req.body.senderName || 'contacto'}`;
        else if (lower.includes('pagar') || lower.includes('factura')) title = `Gestionar pago o factura solicitada por ${req.body.senderName || 'contacto'}`;
        else if (lower.includes('reporte') || lower.includes('informe')) title = `Preparar y enviar reporte a ${req.body.senderName || 'contacto'}`;

        const isUrgent = lower.includes('urgente') || lower.includes('hoy') || lower.includes('antes de') || lower.includes('mañana');

        return res.json({
          hasTasks: true,
          tasks: [
            {
              title,
              description: req.body.message,
              dueDate: isUrgent ? 'Próximas 24 horas' : 'Esta semana',
              priority: isUrgent ? 'high' : 'medium',
              category: lower.includes('pagar') || lower.includes('factura') ? 'work' : 'client',
            }
          ]
        });
      }

      return res.json({ hasTasks: false, tasks: [] });
    }
  });

  // Daily Briefing Endpoint
  app.post('/api/assistant/daily-briefing', async (req, res) => {
    try {
      const { tasks = [], unreadChats = [], ownerName = 'Usuario' } = req.body;

      const prompt = `Genera un informe ejecutivo matutino para WhatsApp de ${ownerName}.
Tareas pendientes actuales (${tasks.length}):
${tasks.map((t: any) => `- [${t.priority.toUpperCase()}] ${t.title} (${t.dueDate || 'Sin fecha'})`).join('\n') || 'No hay tareas registradas.'}

Chats con actividad reciente o sin leer (${unreadChats.length}):
${unreadChats.map((c: any) => `- ${c.name}: "${c.lastMessage?.content || ''}"`).join('\n') || 'No hay mensajes pendientes.'}

Por favor, crea un resumen motivador, claro y organizado con viñetas para que ${ownerName} sepa sus prioridades del día en 30 segundos.`;

      const briefing = await generateWithFallback({
        systemInstruction: 'Eres el asistente personal ejecutivo de WhatsApp. Tu resumen diario debe ser motivador, conciso, ultra claro y organizado con viñetas para que el titular resuelva sus deberes prioritarios.',
        prompt,
      });

      return res.json({ briefing });
    } catch (error: any) {
      console.warn('Error in daily briefing, using fallback summary:', error);
      const pendingList = (req.body.tasks || []).map((t: any) => `• [${t.priority === 'high' ? 'URGENTE' : 'PENDIENTE'}] ${t.title} (${t.dueDate || 'Hoy'})`).join('\n');
      return res.json({
        briefing: `☀️ ¡Buenos días, ${req.body.ownerName || 'Edgar'}!\n\nAquí tienes el resumen de tus compromisos principales registrados en WhatsApp:\n\n${pendingList || '• No tienes deberes pendientes para hoy. ¡Todo al día!'}\n\n💡 Recuerda que el asistente está atendiendo mensajes de forma autónoma. ¡Mucho éxito en tu jornada!`,
      });
    }
  });

  // Direct Multi-Device Companion Sync (No Meta API, No Token Required)
  app.post('/api/companion/sync', async (req, res) => {
    try {
      const { phoneNumber, senderName, message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Falta el mensaje.' });
      }

      console.log(`[Companion Sync] Mensaje de ${senderName || phoneNumber || 'Contacto'}: "${message}"`);

      const prompt = `Último mensaje recibido de ${senderName || 'Contacto'}:\n"${message}"\nGenera la respuesta automática autónoma ideal en formato JSON con las claves: reply, intent, requiresHumanFollowUp, suggestedAction.`;
      const replyJsonStr = await generateWithFallback({
        systemInstruction: 'Eres el asistente ejecutivo de WhatsApp. Responde de forma cordial, profesional y eficiente.',
        prompt,
        responseMimeType: 'application/json',
      });
      const parsed = JSON.parse(replyJsonStr || '{}');

      return res.json({
        status: 'synced',
        reply: parsed.reply,
        intent: parsed.intent,
        suggestedAction: parsed.suggestedAction,
      });
    } catch (err: any) {
      console.error('[Companion Sync] Error:', err);
      return res.status(500).json({
        status: 'fallback',
        reply: 'Hola, he recibido tu mensaje. Te responderé en unos instantes.',
      });
    }
  });

  // Mounting Vite middleware or static serving
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WhatsApp AI Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
