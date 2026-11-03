import { WhatsAppChat, WhatsAppMessage, TaskItem, AssistantSettings, DeviceConnection, ChatbotConfig } from '../types';

export const initialMessages: Record<string, WhatsAppMessage[]> = {
  'chat-1': [
    {
      id: 'm-100',
      chatId: 'chat-1',
      sender: 'ai_assistant',
      content: 'Hola, buen día. Soy el asistente virtual de Edgar Lovera. En este momento no se encuentra disponible, pero dígame, ¿en qué puedo servirle? Para poder ayudarle y atenderle mejor, ¿me podría proporcionar su nombre y el motivo de su contacto, por favor?',
      timestamp: '10:14 AM',
      status: 'read',
      flowNodeId: 'nodo_0',
    },
    {
      id: 'm-101',
      chatId: 'chat-1',
      sender: 'contact',
      content: 'Hola, soy Carlos Morales. Me interesa contratar un paquete de internet y telefonía para mi casa.',
      timestamp: '10:15 AM',
      status: 'read',
    },
    {
      id: 'm-102',
      chatId: 'chat-1',
      sender: 'ai_assistant',
      content: 'Con gusto le brindo información sobre nuestros paquetes. Para ofrecerle la mejor opción, ¿actualmente cuenta con alguna compañía de internet o telefonía?',
      timestamp: '10:15 AM',
      status: 'read',
      isAutonomousReply: true,
      flowNodeId: 'nodo_1',
      detectedIntent: 'informacion_paquetes',
    },
    {
      id: 'm-103',
      chatId: 'chat-1',
      sender: 'contact',
      content: 'Sí, actualmente tengo servicio contratado con Total Play pero busco algo más económico y estable.',
      timestamp: '10:16 AM',
      status: 'read',
    },
    {
      id: 'm-104',
      chatId: 'chat-1',
      sender: 'ai_assistant',
      content: `Le comparto la mejor oferta en internet y telefonía para que se cambie con nosotros conservando su número actual:
🔥 Paquete Total ($389 pesos al mes)
* 🚀 200 Megas de internet.
* 📞 Llamadas ilimitadas.
* 📺 Claro Video con Universal incluido.
* 🌐 Infinity Mobile (internet dentro y fuera de casa).
🎁 Beneficios exclusivos por portabilidad:
* Cero costo en instalación y contratación.
* Su primer pago de $400 pesos se aplica como descuento a su primera mensualidad (el primer mes prácticamente no lo paga).
* ¡3 meses gratis! (Le regalamos el mes 4, 8 y 12).
Contamos con más paquetes si lo requiere. ¿Le interesa esta opción?`,
      timestamp: '10:17 AM',
      status: 'read',
      isAutonomousReply: true,
      flowNodeId: 'nodo_1_1',
      detectedIntent: 'oferta_portabilidad_totalplay',
      suggestedAction: 'Validada compañía Total Play. Conducir a Nodo 1.3 Cierre de Venta',
    },
  ],
  'chat-2': [
    {
      id: 'm-200',
      chatId: 'chat-2',
      sender: 'contact',
      content: 'Buenas tardes, me llamo Laura Méndez. Me acabo de mudar a un departamento nuevo y no tengo internet contratado. ¿Qué opciones tienen?',
      timestamp: '09:20 AM',
      status: 'read',
    },
    {
      id: 'm-201',
      chatId: 'chat-2',
      sender: 'ai_assistant',
      content: `Le comparto esta excelente opción de internet con mayores beneficios y mejor velocidad:
🔥 Paquete Telmex: 200 Megas Simétricos
* 💰 Costo mensual: $489 pesos durante los primeros 12 meses. Después baja a $389 (el gasto de instalación de $1600 se difiere a 12 meses y solo paga un pago inicial de $400 pesos).
* ⚡ Internet simétrico: La misma velocidad de bajada y subida con máxima estabilidad.
* 🌐 Infinitum Móvil: Conexión a internet dentro y fuera de casa.
* 🛡️ Antivirus McAfee incluido.
* 📱 Claro Video para 5 dispositivos sin costo adicional.
🎁 Promociones especiales:
* Streaming gratis por 6 meses (elija entre HBO Max o Netflix) al automatizar su pago.
* 💳 Beneficios adicionales como línea de crédito y más.
¿Qué le parece?`,
      timestamp: '09:21 AM',
      status: 'read',
      isAutonomousReply: true,
      flowNodeId: 'nodo_1_2',
      detectedIntent: 'oferta_cliente_nuevo',
      suggestedAction: 'Oferta enviada. Pasar a Nodo 1.3 Cierre de Venta',
    },
  ],
  'chat-3': [
    {
      id: 'm-301',
      chatId: 'chat-3',
      sender: 'contact',
      content: 'Hola, buenas tardes. Quisiera dar seguimiento a mi trámite de contratación de internet que solicité la semana pasada.',
      timestamp: 'Ayer',
      status: 'read',
    },
    {
      id: 'm-302',
      chatId: 'chat-3',
      sender: 'ai_assistant',
      content: 'Con gusto le ayudo a revisar el estatus de su trámite. Por favor, proporcióneme el nombre a quien quedó el contrato y un número telefónico de contacto.',
      timestamp: 'Ayer',
      status: 'read',
      isAutonomousReply: true,
      flowNodeId: 'nodo_2',
      detectedIntent: 'seguimiento_contratacion',
    },
    {
      id: 'm-303',
      chatId: 'chat-3',
      sender: 'contact',
      content: 'El contrato quedó a nombre de Roberto Gómez Cruz, y mi celular es 55 4890-1122.',
      timestamp: 'Ayer',
      status: 'read',
    },
    {
      id: 'm-304',
      chatId: 'chat-3',
      sender: 'ai_assistant',
      content: 'Muchas gracias por proporcionar sus datos. He notificado de inmediato a Edgar Lovera para que revise el estatus en el sistema de su trámite (Roberto Gómez Cruz, Tel: 55 4890-1122) y le devuelva la respuesta con la fecha programada de visita.',
      timestamp: 'Ayer',
      status: 'read',
      isAutonomousReply: true,
      flowNodeId: 'nodo_2',
      detectedIntent: 'notificacion_estatus_edgar',
      suggestedAction: 'Notificado a Edgar Lovera para consultar en sistema',
    },
  ],
  'chat-4': [
    {
      id: 'm-401',
      chatId: 'chat-4',
      sender: 'contact',
      content: 'Hola Edgar, buen día. Tengo una duda: ¿en la colonia San Jerónimo ya cuentan con cobertura de fibra óptica directa a casa para negocios?',
      timestamp: '08:30 AM',
      status: 'read',
    },
    {
      id: 'm-402',
      chatId: 'chat-4',
      sender: 'ai_assistant',
      content: 'Entiendo. Por favor, especifique su duda o requerimiento con el mayor detalle posible para poder brindarle la respuesta correcta. He capturado su consulta sobre factibilidad de fibra óptica en San Jerónimo y la he escalado directamente a Edgar Lovera para que verifique la cobertura exacta en el mapa de planta externa.',
      timestamp: '08:31 AM',
      status: 'read',
      isAutonomousReply: true,
      flowNodeId: 'nodo_3',
      detectedIntent: 'duda_cobertura_escalada',
      suggestedAction: 'Escalar directamente a Edgar Lovera',
    },
  ],
};

export const initialChats: WhatsAppChat[] = [
  {
    id: 'chat-1',
    name: 'Carlos Morales',
    phoneNumber: '+52 55 4820-9912',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessage: initialMessages['chat-1'][4],
    unreadCount: 0,
    isPinned: true,
    autoPilotEnabled: true,
    currentNodeId: 'nodo_1_1',
    leadData: {
      clientName: 'Carlos Morales',
      contactMotive: 'Información sobre paquetes de internet / telefonía',
      hasCurrentCompany: true,
      currentCompany: 'Total Play',
      selectedPackage: 'Paquete Total $389',
    },
    tags: ['Prospecto', 'Portabilidad Total Play'],
    roleDescription: 'Interesado en cambio a Paquete Total $389',
  },
  {
    id: 'chat-2',
    name: 'Laura Méndez',
    phoneNumber: '+52 55 1289-4450',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastMessage: initialMessages['chat-2'][1],
    unreadCount: 0,
    isPinned: true,
    autoPilotEnabled: true,
    currentNodeId: 'nodo_1_2',
    leadData: {
      clientName: 'Laura Méndez',
      contactMotive: 'Contratación nueva para departamento',
      hasCurrentCompany: false,
      selectedPackage: 'Paquete Telmex 200 Megas Simétricos $489',
    },
    tags: ['Cliente Nuevo', '200 Megas'],
    roleDescription: 'Cliente nueva interesada en Paquete 200M',
  },
  {
    id: 'chat-3',
    name: 'Roberto Gómez',
    phoneNumber: '+52 55 4890-1122',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: initialMessages['chat-3'][3],
    unreadCount: 0,
    isPinned: false,
    autoPilotEnabled: true,
    currentNodeId: 'nodo_2',
    leadData: {
      clientName: 'Roberto Gómez Cruz',
      contractHolderName: 'Roberto Gómez Cruz',
      contractFollowUpPhone: '55 4890-1122',
      contactMotive: 'Seguimiento de estatus de trámite',
    },
    tags: ['Seguimiento', 'En Trámite'],
    roleDescription: 'Esperando respuesta de estatus en sistema',
  },
  {
    id: 'chat-4',
    name: 'Sofía Herrera',
    phoneNumber: '+52 55 9821-1144',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    lastMessage: initialMessages['chat-4'][1],
    unreadCount: 0,
    isPinned: false,
    autoPilotEnabled: true,
    currentNodeId: 'nodo_3',
    leadData: {
      clientName: 'Sofía Herrera',
      contactMotive: 'Duda de cobertura en San Jerónimo',
      generalInquiry: 'Factibilidad de fibra óptica en San Jerónimo',
    },
    tags: ['Duda General', 'Escalado a Edgar'],
    roleDescription: 'Pregunta sobre factibilidad de red',
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Revisar estatus en sistema de contrato para Roberto Gómez Cruz',
    description: 'Seguimiento solicitado en Nodo 2. Titular: Roberto Gómez Cruz, Tel: 55 4890-1122. Verificar fecha de instalación y devolver respuesta.',
    dueDate: 'Hoy, urgente',
    priority: 'high',
    category: 'client',
    status: 'pending',
    sourceChatId: 'chat-3',
    sourceChatName: 'Roberto Gómez',
    sourceSnippet: 'El contrato quedó a nombre de Roberto Gómez Cruz, y mi celular es 55 4890-1122.',
    createdAt: 'Ayer, 18:30',
  },
  {
    id: 'task-2',
    title: 'Continuar contratación Paquete Total $389 para Carlos Morales (Portabilidad Total Play)',
    description: 'Lead clasificado en Nodo 1.1 con compañía Total Play. Listo para recolección de INE y teléfonos en Nodo 1.3.',
    dueDate: 'Hoy, 15:00',
    priority: 'high',
    category: 'client',
    status: 'pending',
    sourceChatId: 'chat-1',
    sourceChatName: 'Carlos Morales',
    sourceSnippet: 'Sí, actualmente tengo servicio contratado con Total Play pero busco algo más económico y estable.',
    createdAt: 'Hoy, 10:16 AM',
  },
  {
    id: 'task-3',
    title: 'Verificar cobertura de fibra óptica en San Jerónimo para Sofía Herrera',
    description: 'Consulta libre escalada desde Nodo 3. Validar mapa de red de planta externa.',
    dueDate: 'Esta tarde',
    priority: 'medium',
    category: 'client',
    status: 'pending',
    sourceChatId: 'chat-4',
    sourceChatName: 'Sofía Herrera',
    sourceSnippet: 'Tengo una duda: ¿en la colonia San Jerónimo ya cuentan con cobertura de fibra óptica directa a casa?',
    createdAt: 'Hoy, 08:30 AM',
  },
];

export const initialSettings: AssistantSettings = {
  autoPilotGlobal: true,
  ownerName: 'Edgar Lovera',
  ownerTitle: 'Telecomunicaciones y Servicios de Internet',
  userContext: `Asistente virtual oficial de Edgar Lovera.
Especializado en venta, contratación y seguimiento de paquetes de internet, telefonía y portabilidad.
Portabilidad estelar: Paquete Total $389/mes (200 Megas, llamadas ilimitadas, Claro Video con Universal, Infinity Mobile, 0 costo instalación, 3 meses gratis mes 4, 8 y 12).
Cliente nuevo estelar: Paquete Telmex 200 Megas Simétricos ($489 primeros 12 meses, luego $389, streaming gratis 6 meses).
Requisitos de cierre (Nodo 1.3): Foto de INE por ambos lados, celular de contacto, teléfono de referencia, email, dirección de instalación (+ número actual si es portabilidad).
Para seguimiento (Nodo 2): Recabar nombre del titular y teléfono para que Edgar revise en sistema.
Para dudas generales (Nodo 3): Escalar directamente a Edgar Lovera.`,
  assistantTone: 'professional',
  autoExtractTasks: true,
  enableAudioAlerts: true,
  replyDelaySeconds: 2,
  operatingHours: {
    start: '09:00',
    end: '20:00',
    activeOnlyInHours: false,
  },
  linkedDeviceConfig: {
    connectionMethod: 'qr_scanner',
    keepSessionAlive: true,
    syncIntervalSeconds: 15,
    allowGroupAutoReplies: false,
    autoReplyUnknownNumbersOnly: false,
  },
};

export const initialDeviceConnection: DeviceConnection = {
  status: 'connected',
  pairedDeviceName: 'WhatsApp Web (Edgar Lovera - Terminal Principal)',
  phoneNumber: '+52 55 4820-9900',
  batteryLevel: 92,
  lastSyncTime: 'Hace un momento',
  devicePairingCode: 'WH-EDGAR-892',
};

export const initialChatbotConfig: ChatbotConfig = {
  enabled: true,
  botName: 'Asistente Virtual de Edgar Lovera',
  businessName: 'Edgar Lovera - Internet & Telefonía',
  welcomeMessageEnabled: true,
  welcomeMessageText:
    'Hola, buen día. Soy el asistente virtual de Edgar Lovera. En este momento no se encuentra disponible, pero dígame, ¿en qué puedo servirle? Para poder ayudarle y atenderle mejor, ¿me podría proporcionar su nombre y el motivo de su contacto, por favor?',
  fallbackMessage:
    'He registrado su solicitud y notificado a Edgar Lovera para que revise los detalles y le devuelva la respuesta a la brevedad. ¡Muchas gracias por su paciencia!',
  outOfHoursMessage:
    'Hola, actualmente estamos fuera del horario de atención. He registrado sus datos y requerimiento para que Edgar Lovera lo atienda a primera hora del día hábil.',
  assistantTone: 'professional',
  systemInstructions: `Eres el Asistente Virtual oficial de Edgar Lovera.
Debes ejecutar el Flujo Conversacional predeterminado:
- Nodo 0: Saludo Inicial y Triaje (Clasificar en: Paquetes [Nodo 1], Seguimiento [Nodo 2], Otra Duda [Nodo 3]).
- Nodo 1: Información acerca de Paquetes (Preguntar si tiene compañía: Sí -> Nodo 1.1 Portados, No -> Nodo 1.2 Nuevo).
- Nodo 1.1: Flujo Clientes Portados (Validar Izzi, Total Play, Megacable; ofrecer Paquete Total $389/mes con 3 meses gratis -> pasar a Nodo 1.3 Cierre).
- Nodo 1.2: Flujo Cliente Nuevo (Ofrecer Paquete Telmex 200 Megas Simétricos $489/mes -> pasar a Nodo 1.3 Cierre).
- Nodo 1.3: Cierre de Venta y Recolección de Datos (Solicitar Foto INE ambos lados, celular, referencia, email, dirección, y número actual si es portabilidad; notificar a Edgar Lovera).
- Nodo 2: Seguimiento de Contratación (Recabar nombre del contrato y teléfono; notificar a Edgar Lovera para revisar estatus en sistema).
- Nodo 3: Otra Pregunta (Capturar duda libre; escalar directamente a Edgar Lovera).`,
  replyDelaySeconds: 2,
  autoExtractTasks: true,
  onlyUnknownNumbers: false,
  totalRepliesSent: 38,
  totalTasksExtracted: 19,
  knowledgeBase: [
    {
      id: 'kb-1',
      topic: 'Paquete Total ($389/mes) - Portabilidad',
      keywords: ['paquete total', '389', 'portabilidad', 'cambiarme', 'conservar mi numero', 'izzi', 'total play', 'megacable'],
      content:
        '🔥 Paquete Total ($389 pesos al mes): 200 Megas de internet, llamadas ilimitadas, Claro Video con Universal incluido, Infinity Mobile (dentro y fuera de casa). Beneficios exclusivos de portabilidad: Cero costo de instalación y contratación, primer pago de $400 se aplica como descuento a la primera mensualidad (el primer mes prácticamente no se paga), y 3 meses gratis (mes 4, 8 y 12).',
    },
    {
      id: 'kb-2',
      topic: 'Paquete Telmex 200 Megas Simétricos ($489/mes) - Cliente Nuevo',
      keywords: ['nuevo', 'nueva linea', 'cliente nuevo', '489', 'simetrico', 'simetricos', 'telmex'],
      content:
        '🔥 Paquete Telmex 200 Megas Simétricos: Costo mensual $489 durante los primeros 12 meses (luego baja a $389). Gasto de instalación de $1600 diferido a 12 meses con pago inicial de $400. Misma velocidad de subida y bajada. Incluye Infinitum Móvil, Antivirus McAfee, Claro Video para 5 dispositivos y streaming gratis por 6 meses (HBO Max o Netflix) al automatizar pago.',
    },
    {
      id: 'kb-3',
      topic: 'Requisitos de Contratación (Nodo 1.3)',
      keywords: ['requisitos', 'documentos', 'que se necesita', 'ine', 'contratar', 'papeles'],
      content:
        'Para avanzar con la solicitud se requiere: Foto de su INE (por ambos lados), número celular de contacto, teléfono de referencia, correo electrónico (Email), y dirección completa donde se hará la instalación. Si es portabilidad, se agrega el número telefónico actual de la otra compañía.',
    },
    {
      id: 'kb-4',
      topic: 'Seguimiento de Contratación (Nodo 2)',
      keywords: ['seguimiento', 'estatus', 'contrato', 'cuando vienen', 'instalacion', 'tramite'],
      content:
        'Para revisar el estatus del trámite en sistema, el asistente solicita el nombre a quien quedó el contrato y un teléfono de contacto, notificando inmediatamente a Edgar Lovera para consulta de orden.',
    },
    {
      id: 'kb-5',
      topic: 'Dudas Generales y Escalamiento (Nodo 3)',
      keywords: ['duda', 'pregunta', 'cobertura', 'otra cosa', 'factura', 'soporte'],
      content:
        'Cualquier requerimiento o duda particular se captura con detalle y se escala directamente a Edgar Lovera para atención personalizada.',
    },
  ],
  rules: [
    {
      id: 'rule-node-0',
      name: 'Nodo 0: Saludo Inicial y Triaje',
      triggerType: 'all',
      keywords: ['hola', 'buen dia', 'informacion', 'ayuda'],
      replyTemplate:
        'Hola, buen día. Soy el asistente virtual de Edgar Lovera. En este momento no se encuentra disponible, pero dígame, ¿en qué puedo servirle? Para poder ayudarle y atenderle mejor, ¿me podría proporcionar su nombre y el motivo de su contacto, por favor?',
      enabled: true,
      actionRequired: 'Triaje a Nodo 1 (Paquetes), Nodo 2 (Seguimiento) o Nodo 3 (Duda)',
    },
    {
      id: 'rule-node-1',
      name: 'Nodo 1: Pregunta de Compañía Actual',
      triggerType: 'keyword',
      keywords: ['paquete', 'internet', 'telefonia', 'telefonía', 'megas', 'costo', 'precio', 'contratar'],
      replyTemplate:
        'Con gusto le brindo información sobre nuestros paquetes. Para ofrecerle la mejor opción, ¿actualmente cuenta con alguna compañía de internet o telefonía?',
      enabled: true,
      actionRequired: 'Bifurcar: Sí -> Nodo 1.1 (Portados), No -> Nodo 1.2 (Nuevo)',
    },
    {
      id: 'rule-node-1-1',
      name: 'Nodo 1.1: Oferta Paquete Total $389 (Portabilidad)',
      triggerType: 'keyword',
      keywords: ['si', 'sí', 'izzi', 'total play', 'totalplay', 'megacable'],
      replyTemplate: `Le comparto la mejor oferta en internet y telefonía para que se cambie con nosotros conservando su número actual:
🔥 Paquete Total ($389 pesos al mes)
* 🚀 200 Megas de internet.
* 📞 Llamadas ilimitadas.
* 📺 Claro Video con Universal incluido.
* 🌐 Infinity Mobile (internet dentro y fuera de casa).
🎁 Beneficios exclusivos por portabilidad:
* Cero costo en instalación y contratación.
* Su primer pago de $400 pesos se aplica como descuento a su primera mensualidad (el primer mes prácticamente no lo paga).
* ¡3 meses gratis! (Le regalamos el mes 4, 8 y 12).
Contamos con más paquetes si lo requiere. ¿Le interesa esta opción?`,
      enabled: true,
      actionRequired: 'Presentar oferta portabilidad y pasar a Nodo 1.3',
    },
    {
      id: 'rule-node-1-2',
      name: 'Nodo 1.2: Oferta Paquete Telmex 200M (Cliente Nuevo)',
      triggerType: 'keyword',
      keywords: ['no', 'nuevo', 'ninguna', 'sin internet', 'no tengo'],
      replyTemplate: `Le comparto esta excelente opción de internet con mayores beneficios y mejor velocidad:
🔥 Paquete Telmex: 200 Megas Simétricos
* 💰 Costo mensual: $489 pesos durante los primeros 12 meses. Después baja a $389 (el gasto de instalación de $1600 se difiere a 12 meses y solo paga un pago inicial de $400 pesos).
* ⚡ Internet simétrico: La misma velocidad de bajada y subida con máxima estabilidad.
* 🌐 Infinitum Móvil: Conexión a internet dentro y fuera de casa.
* 🛡️ Antivirus McAfee incluido.
* 📱 Claro Video para 5 dispositivos sin costo adicional.
🎁 Promociones especiales:
* Streaming gratis por 6 meses (elija entre HBO Max o Netflix) al automatizar su pago.
* 💳 Beneficios adicionales como línea de crédito y más.
¿Qué le parece?`,
      enabled: true,
      actionRequired: 'Presentar oferta nuevo y pasar a Nodo 1.3',
    },
    {
      id: 'rule-node-1-3',
      name: 'Nodo 1.3: Cierre de Venta y Documentos',
      triggerType: 'keyword',
      keywords: ['me interesa', 'quiero contratar', 'adelante', 'como le hacemos', 'si quiero'],
      replyTemplate: `Si le interesa, podemos programar una llamada para disipar cualquier duda. Para ir avanzando con la solicitud, requerimos los siguientes datos básicos. Por favor, compártamelos por este medio:
* Foto de su INE (por ambos lados).
* Número celular de contacto.
* Teléfono de referencia.
* Correo electrónico (Email).
* Dirección completa donde se hará la instalación.`,
      enabled: true,
      actionRequired: 'Recibir documentos y notificar a Edgar Lovera',
    },
    {
      id: 'rule-node-2',
      name: 'Nodo 2: Seguimiento de Contratación',
      triggerType: 'keyword',
      keywords: ['seguimiento', 'estatus', 'mi contrato', 'instalacion', 'cuando vienen', 'ya contrate'],
      replyTemplate:
        'Con gusto le ayudo a revisar el estatus de su trámite. Por favor, proporcióneme el nombre a quien quedó el contrato y un número telefónico de contacto.',
      enabled: true,
      actionRequired: 'Recabar datos y notificar a Edgar Lovera para revisión en sistema',
    },
    {
      id: 'rule-node-3',
      name: 'Nodo 3: Otra Pregunta / Escalamiento',
      triggerType: 'keyword',
      keywords: ['otra duda', 'cobertura', 'aclaracion', 'queja', 'requerimiento', 'pregunta'],
      replyTemplate:
        'Entiendo. Por favor, especifique su duda o requerimiento con el mayor detalle posible para poder brindarle la respuesta correcta.',
      enabled: true,
      actionRequired: 'Capturar requerimiento libre y escalar directamente a Edgar Lovera',
    },
  ],
};
