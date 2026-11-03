import { FlowNodeDefinition, FlowNodeId } from '../types';

export const CONVERSATIONAL_FLOW_NODES: FlowNodeDefinition[] = [
  {
    id: 'nodo_0',
    code: 'Nodo 0',
    name: 'Saludo Inicial y Triaje',
    description: 'Recibe al contacto, se presenta como asistente virtual de Edgar Lovera y clasifica la intención en 3 rutas principales.',
    agentMessage:
      'Hola, buen día. Soy el asistente virtual de Edgar Lovera. En este momento no se encuentra disponible, pero dígame, ¿en qué puedo servirle? Para poder ayudarle y atenderle mejor, ¿me podría proporcionar su nombre y el motivo de su contacto, por favor?',
    routingLogic:
      'El agente analiza la respuesta del usuario para clasificarla en una de tres intenciones principales:\n• Desea información sobre paquetes de internet/telefonía -> Ir al Nodo 1.\n• Desea dar seguimiento a una contratación existente -> Ir al Nodo 2.\n• Tiene otra duda o pregunta general -> Ir al Nodo 3.',
    routingBranches: [
      {
        label: 'Información de Paquetes',
        targetNode: 'nodo_1',
        condition: 'El usuario busca contratar, consultar planes de internet o telefonía, precios o promociones.',
      },
      {
        label: 'Seguimiento de Contratación',
        targetNode: 'nodo_2',
        condition: 'El usuario ya tiene un contrato, trámite en curso, espera instalación o consulta estatus.',
      },
      {
        label: 'Otra Pregunta / Duda General',
        targetNode: 'nodo_3',
        condition: 'Cualquier otra consulta, aclaración, duda libre, queja o soporte.',
      },
    ],
  },
  {
    id: 'nodo_1',
    code: 'Nodo 1',
    name: 'Información acerca de Paquetes',
    description: 'Pregunta si el cliente ya cuenta con compañía de internet o telefonía para bifurcar entre Portabilidad o Cliente Nuevo.',
    agentMessage:
      'Con gusto le brindo información sobre nuestros paquetes. Para ofrecerle la mejor opción, ¿actualmente cuenta con alguna compañía de internet o telefonía?',
    routingLogic:
      'Lógica de Enrutamiento:\n• Si el cliente responde "Sí" -> Ir al Nodo 1.1 (Flujo Clientes Portados).\n• Si el cliente responde "No" -> Ir al Nodo 1.2 (Flujo Cliente Nuevo).',
    routingBranches: [
      {
        label: 'Sí tiene compañía',
        targetNode: 'nodo_1_1',
        condition: 'El cliente responde Sí, o menciona Izzi, Totalplay, Megacable, etc.',
      },
      {
        label: 'No tiene compañía (Nuevo)',
        targetNode: 'nodo_1_2',
        condition: 'El cliente responde No, nuevo domicilio, o no tiene servicio activo.',
      },
    ],
  },
  {
    id: 'nodo_1_1',
    code: 'Nodo 1.1',
    name: 'Flujo Clientes Portados (Portabilidad)',
    description: 'Identifica la compañía actual (Izzi, Total Play, Megacable) y presenta la oferta estelar Paquete Total $389/mes con 3 meses gratis.',
    agentMessage: '¿Qué compañía tiene actualmente?',
    offerMessage: `Le comparto la mejor oferta en internet y telefonía para que se cambie con nosotros conservando su número actual:
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
    routingLogic:
      'Lógica de Validación: El agente debe identificar si menciona Izzi, Total Play o Megacable.\nEnvía el mensaje de oferta Paquete Total $389 y conduce a Nodo 1.3 (Cierre de Venta).',
    routingBranches: [
      {
        label: 'Cierre de Venta (Interés confirmado)',
        targetNode: 'nodo_1_3',
        condition: 'El cliente acepta la oferta o solicita continuar la contratación.',
      },
    ],
  },
  {
    id: 'nodo_1_2',
    code: 'Nodo 1.2',
    name: 'Flujo de Cliente Nuevo',
    description: 'Presenta el paquete de internet para contratación nueva: Paquete Telmex 200 Megas Simétricos ($489 primeros 12 meses, luego $389).',
    agentMessage: `Le comparto esta excelente opción de internet con mayores beneficios y mejor velocidad:
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
    routingLogic:
      'Presenta la oferta simétrica y ventajas de cliente nuevo, luego conduce al Nodo 1.3 (Cierre de Venta).',
    routingBranches: [
      {
        label: 'Cierre de Venta (Interés confirmado)',
        targetNode: 'nodo_1_3',
        condition: 'El cliente se interesa y procede a recolección de documentos.',
      },
    ],
  },
  {
    id: 'nodo_1_3',
    code: 'Nodo 1.3',
    name: 'Cierre de Venta y Recolección de Datos',
    description: 'Solicita INE, teléfonos, email, dirección de instalación y número actual (si es portabilidad). Notifica a Edgar Lovera.',
    agentMessage: `Si le interesa, podemos programar una llamada para disipar cualquier duda. Para ir avanzando con la solicitud, requerimos los siguientes datos básicos. Por favor, compártamelos por este medio:
* Foto de su INE (por ambos lados).
* Número celular de contacto.
* Teléfono de referencia.
* Correo electrónico (Email).
* Dirección completa donde se hará la instalación.`,
    routingLogic:
      'Recibir documentos y notificar a Edgar Lovera para continuar el trámite.\nSi el cliente proviene del Nodo 1.1 (Portabilidad), se agrega como requisito: "* Número telefónico actual de su otra compañía para realizar la portabilidad."',
    actionRequired: 'Notificar inmediatamente a Edgar Lovera para continuar el trámite de contratación y alta.',
  },
  {
    id: 'nodo_2',
    code: 'Nodo 2',
    name: 'Seguimiento de Contratación',
    description: 'Solicita nombre del titular del contrato y teléfono de contacto para que Edgar Lovera consulte estatus en sistema.',
    agentMessage:
      'Con gusto le ayudo a revisar el estatus de su trámite. Por favor, proporcióneme el nombre a quien quedó el contrato y un número telefónico de contacto.',
    routingLogic:
      'Recabar la información y notificar a Edgar Lovera para que revise el estatus en sistema y devuelva la respuesta al cliente.',
    actionRequired: 'Notificar a Edgar Lovera para revisar estatus en sistema y devolver respuesta.',
  },
  {
    id: 'nodo_3',
    code: 'Nodo 3',
    name: 'Otra Pregunta',
    description: 'Recibe requerimientos libres, consultas o dudas específicas y escala directamente a Edgar Lovera.',
    agentMessage:
      'Entiendo. Por favor, especifique su duda o requerimiento con el mayor detalle posible para poder brindarle la respuesta correcta.',
    routingLogic:
      'Capturar la duda libre del cliente. Si el agente no tiene la respuesta programada, escalar directamente a Edgar Lovera.',
    actionRequired: 'Escalar directamente la duda o requerimiento a Edgar Lovera.',
    isEscalation: true,
  },
];

export const FLOW_NODES_MAP: Record<FlowNodeId, FlowNodeDefinition> = CONVERSATIONAL_FLOW_NODES.reduce(
  (acc, node) => {
    acc[node.id] = node;
    return acc;
  },
  {} as Record<FlowNodeId, FlowNodeDefinition>
);
