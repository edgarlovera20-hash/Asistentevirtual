import { FlowNodeId, ConversationLeadData, FlowNodeDefinition } from '../types';
import { CONVERSATIONAL_FLOW_NODES, FLOW_NODES_MAP } from './flowDefinition';

export interface FlowProcessingResult {
  reply: string;
  nextNodeId: FlowNodeId;
  previousNodeId: FlowNodeId;
  detectedIntent: string;
  suggestedAction?: string;
  notifyEdgarLovera: boolean;
  notificationMessage?: string;
  createdTask?: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: 'client' | 'work';
  };
  updatedLeadData: ConversationLeadData;
  validationMatched?: string;
}

/**
 * Extracts key lead data such as company, name, phone, email, and address from text.
 */
export function extractLeadData(text: string, existing: ConversationLeadData = {}): ConversationLeadData {
  const updated: ConversationLeadData = { ...existing };
  const lower = text.toLowerCase();

  // 1. Company Detection (Izzi, Total Play, Megacable, etc.)
  if (lower.includes('total play') || lower.includes('totalplay') || lower.includes('total-play')) {
    updated.currentCompany = 'Total Play';
    updated.hasCurrentCompany = true;
  } else if (lower.includes('izzi')) {
    updated.currentCompany = 'Izzi';
    updated.hasCurrentCompany = true;
  } else if (lower.includes('megacable') || lower.includes('mega cable')) {
    updated.currentCompany = 'Megacable';
    updated.hasCurrentCompany = true;
  } else if (lower.includes('telmex') || lower.includes('infinitum')) {
    updated.currentCompany = 'Telmex';
    updated.hasCurrentCompany = true;
  }

  // 2. Email Detection
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    updated.email = emailMatch[0];
  }

  // 3. Phone Numbers (10 digits)
  const phoneMatches = text.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g);
  if (phoneMatches && phoneMatches.length > 0) {
    if (!updated.phoneContact) {
      updated.phoneContact = phoneMatches[0];
      if (phoneMatches.length > 1) {
        updated.phoneReference = phoneMatches[1];
      }
    } else if (!updated.phoneReference && phoneMatches[0] !== updated.phoneContact) {
      updated.phoneReference = phoneMatches[0];
    }
  }

  // 4. INE / Documents mention
  if (lower.includes('ine') || lower.includes('credencial') || lower.includes('foto') || lower.includes('adjunto')) {
    updated.ineProvided = true;
  }

  // 5. Name heuristics if formatted like "Soy X", "Mi nombre es X", "A nombre de X"
  const nameMatch = text.match(/(?:soy|me llamo|mi nombre es|a nombre de)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,35})/i);
  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim().split(/[,\.\n]/)[0].trim();
    if (rawName.length > 2) {
      updated.clientName = rawName;
    }
  }

  // 6. Address cues
  if (lower.includes('calle') || lower.includes('av.') || lower.includes('avenida') || lower.includes('col.') || lower.includes('colonia') || lower.includes('c.p.') || lower.includes('#')) {
    updated.installationAddress = text.trim();
  }

  return updated;
}

/**
 * Executes the state machine according to the user's Flow Structure:
 *
 * Nodo 0: Saludo Inicial y Triaje
 *   - Paquetes -> Nodo 1
 *   - Seguimiento -> Nodo 2
 *   - Otra duda -> Nodo 3
 * Nodo 1: Información acerca de Paquetes
 *   - Sí -> Nodo 1.1
 *   - No -> Nodo 1.2
 * Nodo 1.1: Flujo Clientes Portados (Portabilidad)
 *   - Identificar Izzi, Total Play, Megacable
 *   - Oferta Paquete Total $389 -> Nodo 1.3
 * Nodo 1.2: Flujo Cliente Nuevo
 *   - Oferta Paquete Telmex 200 Megas Simétricos $489 -> Nodo 1.3
 * Nodo 1.3: Cierre de Venta y Recolección de Datos
 *   - Notificar a Edgar Lovera
 * Nodo 2: Seguimiento de Contratación
 *   - Notificar a Edgar Lovera para revisar estatus en sistema
 * Nodo 3: Otra Pregunta
 *   - Escalar directamente a Edgar Lovera
 */
export function processConversationalFlow(
  incomingMessage: string,
  currentNodeId: FlowNodeId = 'nodo_0',
  currentLead: ConversationLeadData = {},
  senderName: string = 'Cliente'
): FlowProcessingResult {
  const text = incomingMessage.trim();
  const lower = text.toLowerCase();
  const updatedLead = extractLeadData(text, currentLead);
  if (!updatedLead.clientName && senderName && senderName !== 'Contacto' && senderName !== 'Usuario de Prueba') {
    updatedLead.clientName = senderName;
  }

  // Case 1: Currently at Nodo 0 (or new conversation)
  if (currentNodeId === 'nodo_0') {
    // Check for package inquiry intent
    const isPackageIntent =
      lower.includes('paquete') ||
      lower.includes('internet') ||
      lower.includes('telefon') ||
      lower.includes('megas') ||
      lower.includes('velocidad') ||
      lower.includes('contratar') ||
      lower.includes('cambiar') ||
      lower.includes('portabilidad') ||
      lower.includes('precio') ||
      lower.includes('costo') ||
      lower.includes('oferta') ||
      lower.includes('promocion') ||
      lower.includes('plan');

    // Check for follow-up on existing contract
    const isFollowUpIntent =
      lower.includes('seguimiento') ||
      lower.includes('estatus') ||
      lower.includes('contrato') ||
      lower.includes('trámite') ||
      lower.includes('tramite') ||
      lower.includes('instalacion') ||
      lower.includes('instalación') ||
      lower.includes('cuándo vienen') ||
      lower.includes('cuando vienen') ||
      lower.includes('ya contraté') ||
      lower.includes('ya contrate') ||
      lower.includes('mi número de reporte') ||
      lower.includes('orden de servicio');

    if (isPackageIntent) {
      updatedLead.contactMotive = 'Información sobre paquetes de internet / telefonía';
      return {
        reply: FLOW_NODES_MAP.nodo_1.agentMessage,
        nextNodeId: 'nodo_1',
        previousNodeId: 'nodo_0',
        detectedIntent: 'informacion_paquetes',
        suggestedAction: 'Identificar si cuenta con compañía actual o es cliente nuevo',
        notifyEdgarLovera: false,
        updatedLeadData: updatedLead,
      };
    } else if (isFollowUpIntent) {
      updatedLead.contactMotive = 'Seguimiento a contratación existente';
      return {
        reply: FLOW_NODES_MAP.nodo_2.agentMessage,
        nextNodeId: 'nodo_2',
        previousNodeId: 'nodo_0',
        detectedIntent: 'seguimiento_contratacion',
        suggestedAction: 'Recabar nombre del contrato y teléfono para Edgar Lovera',
        notifyEdgarLovera: false,
        updatedLeadData: updatedLead,
      };
    } else {
      // General question / other inquiry
      updatedLead.contactMotive = text;
      return {
        reply: FLOW_NODES_MAP.nodo_3.agentMessage,
        nextNodeId: 'nodo_3',
        previousNodeId: 'nodo_0',
        detectedIntent: 'otra_duda_general',
        suggestedAction: 'Capturar requerimiento libre para escalar a Edgar Lovera',
        notifyEdgarLovera: false,
        updatedLeadData: updatedLead,
      };
    }
  }

  // Case 2: Currently at Nodo 1 (Asking if currently has company)
  if (currentNodeId === 'nodo_1') {
    const hasCompanyAffirmative =
      lower.startsWith('si') ||
      lower.includes('sí') ||
      lower.includes('tengo') ||
      lower.includes('con izzi') ||
      lower.includes('con total') ||
      lower.includes('con mega') ||
      lower.includes('actualmente con') ||
      Boolean(updatedLead.currentCompany);

    const hasCompanyNegative =
      lower.startsWith('no') ||
      lower.includes('ningun') ||
      lower.includes('nuevo') ||
      lower.includes('apenas voy') ||
      lower.includes('no tengo') ||
      lower.includes('sin compañia') ||
      lower.includes('sin compañía');

    if (hasCompanyAffirmative && !hasCompanyNegative) {
      updatedLead.hasCurrentCompany = true;

      // If they already mentioned the company in this same message
      if (updatedLead.currentCompany) {
        return {
          reply: `Perfecto, identifico que está con ${updatedLead.currentCompany}.\n\n${FLOW_NODES_MAP.nodo_1_1.offerMessage!}`,
          nextNodeId: 'nodo_1_1',
          previousNodeId: 'nodo_1',
          detectedIntent: 'cliente_portabilidad_detectado',
          suggestedAction: 'Oferta presentada. Esperando confirmación para Nodo 1.3 Cierre',
          notifyEdgarLovera: false,
          updatedLeadData: { ...updatedLead, selectedPackage: 'Paquete Total $389' },
          validationMatched: updatedLead.currentCompany,
        };
      }

      return {
        reply: FLOW_NODES_MAP.nodo_1_1.agentMessage,
        nextNodeId: 'nodo_1_1',
        previousNodeId: 'nodo_1',
        detectedIntent: 'cliente_portabilidad_pendiente_compania',
        suggestedAction: 'Validar si menciona Izzi, Total Play o Megacable',
        notifyEdgarLovera: false,
        updatedLeadData: updatedLead,
      };
    } else {
      // Cliente Nuevo -> Nodo 1.2
      updatedLead.hasCurrentCompany = false;
      return {
        reply: FLOW_NODES_MAP.nodo_1_2.agentMessage,
        nextNodeId: 'nodo_1_2',
        previousNodeId: 'nodo_1',
        detectedIntent: 'cliente_nuevo',
        suggestedAction: 'Oferta cliente nuevo presentada. Conducir a Nodo 1.3 Cierre',
        notifyEdgarLovera: false,
        updatedLeadData: { ...updatedLead, selectedPackage: 'Paquete Telmex 200 Megas Simétricos $489' },
      };
    }
  }

  // Case 3: Currently at Nodo 1.1 (Validating current company & presenting portabilidad offer)
  if (currentNodeId === 'nodo_1_1') {
    // If they were asked which company, detect Izzi, Total Play, Megacable
    let matchedCompany = updatedLead.currentCompany;
    if (!matchedCompany) {
      if (lower.includes('izzi')) matchedCompany = 'Izzi';
      else if (lower.includes('total play') || lower.includes('totalplay')) matchedCompany = 'Total Play';
      else if (lower.includes('megacable') || lower.includes('mega cable')) matchedCompany = 'Megacable';
      else if (lower.includes('telmex')) matchedCompany = 'Telmex';
      else matchedCompany = text;
      updatedLead.currentCompany = matchedCompany;
    }

    // Did user already say yes to the offer or are they answering company?
    const isAcceptingOffer =
      lower.includes('si') ||
      lower.includes('sí') ||
      lower.includes('me interesa') ||
      lower.includes('quiero') ||
      lower.includes('me parece bien') ||
      lower.includes('adelante') ||
      lower.includes('perfecto') ||
      lower.includes('cómo le hacemos') ||
      lower.includes('como le hacemos') ||
      lower.includes('contratar');

    // If message is just specifying company (e.g. "Total Play" or "Tengo Izzi")
    const justMentioningCompany = !isAcceptingOffer || lower.includes('izzi') || lower.includes('total play') || lower.includes('megacable');

    if (justMentioningCompany && !lower.includes('no me interesa')) {
      return {
        reply: FLOW_NODES_MAP.nodo_1_1.offerMessage!,
        nextNodeId: 'nodo_1_1',
        previousNodeId: 'nodo_1_1',
        detectedIntent: 'validacion_compania_portabilidad',
        suggestedAction: 'Oferta enviada. Esperando respuesta para pasar a Nodo 1.3',
        notifyEdgarLovera: false,
        updatedLeadData: { ...updatedLead, selectedPackage: 'Paquete Total $389' },
        validationMatched: matchedCompany,
      };
    }

    // User confirmed interest -> advance to Nodo 1.3 with portability requirement
    const closingPortabilityMsg = `${FLOW_NODES_MAP.nodo_1_3.agentMessage}\n* Número telefónico actual de su otra compañía (${updatedLead.currentCompany || 'proveedor actual'}) para realizar la portabilidad.`;

    return {
      reply: closingPortabilityMsg,
      nextNodeId: 'nodo_1_3',
      previousNodeId: 'nodo_1_1',
      detectedIntent: 'cierre_venta_portabilidad',
      suggestedAction: 'Esperando recepción de INE y datos para notificar a Edgar Lovera',
      notifyEdgarLovera: false,
      updatedLeadData: updatedLead,
    };
  }

  // Case 4: Currently at Nodo 1.2 (Cliente Nuevo offer)
  if (currentNodeId === 'nodo_1_2') {
    // If user accepts or responds with interest
    const closingNewClientMsg = FLOW_NODES_MAP.nodo_1_3.agentMessage;

    return {
      reply: closingNewClientMsg,
      nextNodeId: 'nodo_1_3',
      previousNodeId: 'nodo_1_2',
      detectedIntent: 'cierre_venta_cliente_nuevo',
      suggestedAction: 'Esperando recepción de INE y datos para notificar a Edgar Lovera',
      notifyEdgarLovera: false,
      updatedLeadData: updatedLead,
    };
  }

  // Case 5: Currently at Nodo 1.3 (Recolección de datos y Cierre de Venta)
  if (currentNodeId === 'nodo_1_3') {
    const clientName = updatedLead.clientName || senderName || 'Cliente';
    const companyInfo = updatedLead.currentCompany ? ` (Portabilidad desde ${updatedLead.currentCompany})` : ' (Cliente Nuevo)';
    const selectedPkg = updatedLead.selectedPackage || 'Paquete de Internet';

    const reply = `¡Muchas gracias, ${clientName}! He recibido sus datos y documentos completos por este medio. He notificado de inmediato a Edgar Lovera con su solicitud para continuar con la contratación de su ${selectedPkg}${companyInfo} y coordinar la visita de instalación. En breve se comunicará personalmente con usted. 👍`;

    const taskTitle = `Continuar contratación: ${selectedPkg} - ${clientName}`;
    const taskDesc = `Datos recopilados en Nodo 1.3:\n• Teléfono de contacto: ${updatedLead.phoneContact || 'Pendiente'}\n• Teléfono referencia: ${updatedLead.phoneReference || 'N/A'}\n• Correo: ${updatedLead.email || 'N/A'}\n• Dirección: ${updatedLead.installationAddress || 'Ver fotos/chat'}\n• Compañía actual / Portabilidad: ${updatedLead.currentCompany || 'Cliente Nuevo'}\n• Mensaje del cliente: "${text}"`;

    return {
      reply,
      nextNodeId: 'nodo_1_3',
      previousNodeId: 'nodo_1_3',
      detectedIntent: 'documentos_recibidos_cierre',
      suggestedAction: 'Trámite enviado a Edgar Lovera para continuar contratación',
      notifyEdgarLovera: true,
      notificationMessage: `🔔 Edgar Lovera: Nueva solicitud de contratación recibida de ${clientName} (${selectedPkg}). Revisa los documentos en el chat.`,
      createdTask: {
        title: taskTitle,
        description: taskDesc,
        priority: 'high',
        category: 'client',
      },
      updatedLeadData: { ...updatedLead, statusNotes: 'Documentos recibidos. Notificado a Edgar Lovera.' },
    };
  }

  // Case 6: Currently at Nodo 2 (Seguimiento de Contratación)
  if (currentNodeId === 'nodo_2') {
    const clientName = updatedLead.contractHolderName || updatedLead.clientName || senderName || 'Titular';
    const phone = updatedLead.contractFollowUpPhone || updatedLead.phoneContact || 'Proporcionado en chat';

    const reply = `Muchas gracias por proporcionar sus datos de contrato. He notificado inmediatamente a Edgar Lovera con los datos proporcionados (Titular: ${clientName}, Teléfono: ${phone}) para que consulte el estatus de su trámite en el sistema y le devuelva la respuesta a la brevedad posible.`;

    const taskTitle = `Revisar estatus de contrato en sistema para ${clientName}`;
    const taskDesc = `Seguimiento solicitado por cliente (Nodo 2):\n• Titular del contrato: ${clientName}\n• Teléfono de contacto: ${phone}\n• Detalle del mensaje: "${text}"`;

    return {
      reply,
      nextNodeId: 'nodo_2',
      previousNodeId: 'nodo_2',
      detectedIntent: 'datos_seguimiento_recibidos',
      suggestedAction: 'Notificado a Edgar Lovera para consultar estatus en sistema',
      notifyEdgarLovera: true,
      notificationMessage: `🔔 Edgar Lovera: Solicitud de estatus de contrato para ${clientName} (Tel: ${phone}).`,
      createdTask: {
        title: taskTitle,
        description: taskDesc,
        priority: 'high',
        category: 'client',
      },
      updatedLeadData: { ...updatedLead, contractHolderName: clientName, contractFollowUpPhone: phone },
    };
  }

  // Case 7: Currently at Nodo 3 (Otra Pregunta libre / Escalamiento)
  if (currentNodeId === 'nodo_3') {
    const clientName = updatedLead.clientName || senderName || 'Contacto';
    const reply = `He capturado su consulta con todos los detalles: "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}". Como requiere atención personalizada, he escalado su requerimiento directamente a Edgar Lovera para que le brinde la respuesta correcta en cuanto esté disponible. ¡Muchas gracias por su paciencia!`;

    const taskTitle = `Atender consulta escalada de ${clientName}`;
    const taskDesc = `Requerimiento libre recibido en Nodo 3:\n"${text}"\nCliente: ${clientName} (Tel: ${updatedLead.phoneContact || 'Ver chat'})`;

    return {
      reply,
      nextNodeId: 'nodo_3',
      previousNodeId: 'nodo_3',
      detectedIntent: 'duda_escalada_directamente',
      suggestedAction: 'Escalado directamente a Edgar Lovera',
      notifyEdgarLovera: true,
      notificationMessage: `🔔 Edgar Lovera: Nueva consulta de ${clientName} escalada directamente.`,
      createdTask: {
        title: taskTitle,
        description: taskDesc,
        priority: 'medium',
        category: 'client',
      },
      updatedLeadData: { ...updatedLead, generalInquiry: text },
    };
  }

  // Default fallback to Nodo 0
  return {
    reply: FLOW_NODES_MAP.nodo_0.agentMessage,
    nextNodeId: 'nodo_0',
    previousNodeId: 'nodo_0',
    detectedIntent: 'saludo_triaje_default',
    suggestedAction: 'Triaje de intención inicial',
    notifyEdgarLovera: false,
    updatedLeadData: updatedLead,
  };
}
