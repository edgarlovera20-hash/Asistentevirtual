import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  CheckCheck, 
  Clock, 
  User, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Mic,
  MicOff,
  ListPlus,
  MessageSquarePlus,
  Check,
  GitBranch,
  Layers,
  RotateCcw,
  Building2,
  FileText,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { WhatsAppChat, WhatsAppMessage, TaskItem, FlowNodeId } from '../types';
import { FLOW_NODES_MAP, CONVERSATIONAL_FLOW_NODES } from '../utils/flowDefinition';
import { useVoiceRecorder } from '../utils/useVoiceRecorder';
import { VoiceRecorderBar } from './VoiceRecorderBar';
import { VoiceDictationModal } from './VoiceDictationModal';

interface ChatWindowProps {
  chat: WhatsAppChat;
  messages: WhatsAppMessage[];
  onSendMessage: (chatId: string, content: string) => void;
  onToggleChatAutoPilot: (chatId: string) => void;
  onRequestAiDraft: (chatId: string) => Promise<string | null>;
  onSimulateIncomingFromCurrent: (chatId: string, customText?: string) => void;
  isGeneratingAiDraft: boolean;
  onBackMobile?: () => void;
  onAddVoiceTask?: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onSetChatFlowNode?: (chatId: string, nodeId: FlowNodeId) => void;
  onResetChatFlow?: (chatId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  onSendMessage,
  onToggleChatAutoPilot,
  onRequestAiDraft,
  onSimulateIncomingFromCurrent,
  isGeneratingAiDraft,
  onBackMobile,
  onAddVoiceTask,
  onSetChatFlowNode,
  onResetChatFlow,
}) => {
  const [inputText, setInputText] = useState('');
  const [showSimulatePrompt, setShowSimulatePrompt] = useState(false);
  const [simulateMessageText, setSimulateMessageText] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceModalMode, setVoiceModalMode] = useState<'chat' | 'task'>('chat');
  const [transcribedNotice, setTranscribedNotice] = useState<string | null>(null);
  const [showQuickChips, setShowQuickChips] = useState(false);
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeNodeId: FlowNodeId = chat.currentNodeId || 'nodo_0';
  const activeNode = FLOW_NODES_MAP[activeNodeId] || FLOW_NODES_MAP.nodo_0;
  const leadData = chat.leadData || {};

  // Hook for in-line voice recording via MediaRecorder API
  const voiceRecorder = useVoiceRecorder({
    onTranscriptionComplete: (transcription, structuredTask) => {
      if (structuredTask && structuredTask.title && onAddVoiceTask) {
        onAddVoiceTask({
          title: structuredTask.title,
          description: structuredTask.description || transcription,
          dueDate: structuredTask.dueDate || 'Hoy',
          priority: structuredTask.priority || 'medium',
          category: structuredTask.category || 'work',
          status: 'pending',
          sourceChatId: chat.id,
          sourceChatName: chat.name,
          sourceSnippet: transcription.slice(0, 80),
        });
        setTranscribedNotice(`Tarea dictada registrada: "${structuredTask.title}"`);
      } else {
        setInputText((prev) => (prev ? `${prev} ${transcription}` : transcription));
        setTranscribedNotice('Voz transcrita con éxito por Gemini');
      }
      setTimeout(() => setTranscribedNotice(null), 4000);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chat.isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(chat.id, inputText.trim());
    setInputText('');
  };

  const handleGenerateDraft = async () => {
    const draft = await onRequestAiDraft(chat.id);
    if (draft) {
      setInputText(draft);
    }
  };

  const getNodeContextualChips = (nodeId: FlowNodeId): string[] => {
    switch (nodeId) {
      case 'nodo_0':
        return [
          'Deseo información sobre paquetes de internet y telefonía.',
          'Quiero dar seguimiento a mi contratación existente.',
          'Tengo una duda o pregunta general sobre los servicios.',
        ];
      case 'nodo_1':
        return [
          'Sí, actualmente cuento con compañía de internet.',
          'No, no tengo compañía actualmente (soy cliente nuevo).',
          'Tengo contratado Total Play actualmente.',
        ];
      case 'nodo_1_1':
        return [
          'Total Play',
          'Izzi',
          'Megacable',
          'Sí me interesa la opción del Paquete Total de $389 al mes.',
        ];
      case 'nodo_1_2':
        return [
          'Me parece excelente la opción de 200 Megas Simétricos, me interesa.',
          '¿Cómo iniciamos el trámite de contratación nueva?',
        ];
      case 'nodo_1_3':
        return [
          'Adjunto foto de INE, cel 55 1234-5678, ref 55 8765-4321, email cliente@gmail.com, dir Calle Reforma 123.',
          'Mi número actual de la otra compañía a portar es 55 9988-7766.',
        ];
      case 'nodo_2':
        return [
          'El contrato quedó a nombre de Roberto Gómez Cruz, mi celular es 55 4890-1122.',
          'Contrato a nombre de Carlos López, teléfono 55 3322-1100.',
        ];
      case 'nodo_3':
        return [
          '¿En qué zonas tienen cobertura de fibra óptica directa?',
          'Tengo una duda técnica sobre el módem y la velocidad.',
        ];
      default:
        return [
          'Hola, ¿me podrías brindar informes?',
          'Recibido correctamente. Muchas gracias.',
        ];
    }
  };

  return (
    <section className="flex-1 flex flex-col h-full bg-[#0b141a] overflow-hidden relative">
      {/* Header */}
      <header className="bg-[#202c33] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-sm text-slate-200 shrink-0">
            {chat.avatarUrl ? (
              <img
                src={chat.avatarUrl}
                alt={chat.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              chat.name.slice(0, 2).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-slate-100 truncate">{chat.name}</h2>
              {chat.isPinned && (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                  Fijado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">{chat.phoneNumber}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 text-[11px]">En línea</span>
            </div>
          </div>
        </div>

        {/* Actions & Auto-Pilot Toggle for this specific contact */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setVoiceModalMode('task');
              setShowVoiceModal(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 transition-colors"
            title="Dictar un encargo o tarea por voz a partir de este chat"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dictar Tarea</span>
          </button>

          <button
            onClick={() => setShowSimulatePrompt(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg text-xs font-medium text-slate-300 bg-[#111b21] hover:bg-slate-700/60 border border-slate-700/60 transition-colors"
            title="Simular que este contacto te escribe un WhatsApp"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Simular Mensaje</span>
          </button>

          <button
            onClick={() => onToggleChatAutoPilot(chat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-semibold transition-all border ${
              chat.autoPilotEnabled
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
            title="Si está activo, Gemini responde automáticamente a este contacto"
          >
            <Bot className={`w-3.5 h-3.5 ${chat.autoPilotEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Auto-Pilot:</span>
            <span>{chat.autoPilotEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* Interactive Conversational Flow Status Bar */}
      <div className="bg-[#111b21] border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700/80 px-2 py-0.5 rounded-md text-emerald-300 font-mono text-[11px]">
            <GitBranch className="w-3 h-3 text-emerald-400" />
            <span className="font-bold">{activeNode.code}:</span>
            <span className="text-emerald-200">{activeNode.name}</span>
          </div>

          {/* Lead Quick Badges */}
          {leadData.currentCompany && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-sky-950/70 border border-sky-800/60 text-sky-300 px-2 py-0.5 rounded text-[11px]">
              <Building2 className="w-2.5 h-2.5" />
              {leadData.currentCompany}
            </span>
          )}
          {leadData.selectedPackage && (
            <span className="hidden md:inline-flex items-center gap-1 bg-amber-950/70 border border-amber-800/60 text-amber-300 px-2 py-0.5 rounded text-[11px]">
              🔥 {leadData.selectedPackage}
            </span>
          )}
        </div>

        {/* Node controls & reset */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Quick Node Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNodeSelector(!showNodeSelector)}
              className="flex items-center gap-1 text-[11px] bg-[#202c33] hover:bg-slate-700 border border-slate-700 text-slate-300 px-2 py-1 rounded transition-colors cursor-pointer"
              title="Cambiar manualmente de nodo"
            >
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Cambiar Nodo</span>
            </button>

            {showNodeSelector && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#202c33] border border-slate-700 rounded-lg shadow-xl z-30 p-1.5 space-y-1 animate-fade-in">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                  Saltar al Nodo del Flujo:
                </div>
                {CONVERSATIONAL_FLOW_NODES.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      if (onSetChatFlowNode) onSetChatFlowNode(chat.id, node.id);
                      setShowNodeSelector(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      activeNodeId === node.id
                        ? 'bg-emerald-950/80 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <span>{node.code} - {node.name}</span>
                    {activeNodeId === node.id && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Flow to Node 0 */}
          {onResetChatFlow && (
            <button
              type="button"
              onClick={() => onResetChatFlow(chat.id)}
              className="flex items-center gap-1 text-[11px] bg-[#202c33] hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-colors cursor-pointer"
              title="Reiniciar flujo conversacional a Nodo 0"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Canvas */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3.5"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(18, 28, 34, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(18, 28, 34, 0.4) 0%, transparent 40%)`,
        }}
      >
        {/* Security & encryption disclaimer */}
        <div className="max-w-md mx-auto my-2 p-2 rounded-lg bg-[#182229]/80 border border-slate-800 text-center text-[11px] text-amber-200/80 flex items-center justify-center gap-1.5 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Flujo activo: Asistente virtual de Edgar Lovera operando bajo el flujo predeterminado.</span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isAi = msg.sender === 'ai_assistant';
          const isContact = msg.sender === 'contact';
          const nodeMeta = msg.flowNodeId ? FLOW_NODES_MAP[msg.flowNodeId] : null;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser || isAi ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed relative ${
                  isAi
                    ? 'bg-[#005c4b] text-white border border-emerald-500/40 rounded-tr-xs'
                    : isUser
                    ? 'bg-[#005c4b] text-slate-100 rounded-tr-xs'
                    : 'bg-[#202c33] text-slate-100 rounded-tl-xs'
                }`}
              >
                {/* AI Autonomous Badge Header */}
                {isAi && (
                  <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-emerald-400/20 text-[10px] text-emerald-300 font-medium">
                    <Bot className="w-3 h-3 text-emerald-300" />
                    <span>Asistente Edgar Lovera</span>
                    {nodeMeta ? (
                      <span className="ml-auto bg-emerald-950/80 border border-emerald-700/60 px-1.5 py-0.2 rounded text-[9px] font-mono text-emerald-300">
                        {nodeMeta.code}
                      </span>
                    ) : msg.detectedIntent ? (
                      <span className="ml-auto bg-emerald-950/60 px-1.5 py-0.2 rounded text-[9px] font-mono text-emerald-200">
                        {msg.detectedIntent}
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Message Content */}
                <p className="whitespace-pre-wrap select-text">{msg.content}</p>

                {/* Suggested Action Note (if any) */}
                {msg.suggestedAction && (
                  <div className="mt-1.5 pt-1 border-t border-emerald-400/20 text-[10px] text-emerald-200/90 italic flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>Nota: {msg.suggestedAction}</span>
                  </div>
                )}

                {/* Metadata timestamp & read tick */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-300/80 mt-1 font-mono">
                  <span>{msg.timestamp}</span>
                  {(isUser || isAi) && (
                    <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {chat.isTyping && (
          <div className="flex items-center gap-2 p-2 bg-[#202c33] border border-slate-700/60 rounded-xl w-fit text-xs text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px]">Asistente IA analizando y respondiendo...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Voice Transcription Controls */}
      <footer className="bg-[#202c33] border-t border-slate-800 p-2.5 sm:p-3 shrink-0 space-y-2">
        {/* Transcription Notice / Feedback banner */}
        {transcribedNotice && (
          <div className="flex items-center justify-between text-[11px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/50 rounded-lg px-3 py-1 animate-fade-in">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{transcribedNotice}</span>
            </div>
            <button
              onClick={() => setTranscribedNotice(null)}
              className="text-emerald-400 hover:text-white text-xs ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Quick Replies & Dictation Bar toggle row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setShowQuickChips(!showQuickChips)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors shrink-0 cursor-pointer ${
              showQuickChips
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-[#111b21] border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquarePlus className="w-3 h-3" />
            <span>Respuestas Rápidas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setVoiceModalMode('chat');
              setShowVoiceModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#111b21] hover:bg-slate-700/60 border border-slate-700/80 text-slate-300 transition-colors shrink-0 cursor-pointer"
            title="Abrir modal de dictado de voz para chat"
          >
            <Mic className="w-3 h-3 text-emerald-400" />
            <span>Dictado Completo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setVoiceModalMode('task');
              setShowVoiceModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 transition-colors shrink-0 cursor-pointer"
            title="Dictar una tarea pendiente desde este chat"
          >
            <ListPlus className="w-3 h-3 text-emerald-400" />
            <span>Dictar Deber</span>
          </button>
        </div>

        {/* Expanded Quick Reply Chips */}
        {showQuickChips && (
          <div className="space-y-1.5 py-1 text-xs animate-fade-in">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
              <span>Respuestas guiadas según {activeNode.code} ({activeNode.name}):</span>
              <span className="text-slate-400">Click para escribir</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {getNodeContextualChips(activeNodeId).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(chip)}
                  className="bg-[#111b21] hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active In-line Voice Recording Bar (MediaRecorder) */}
        {voiceRecorder.isRecording || voiceRecorder.isTranscribing || voiceRecorder.errorMessage ? (
          <VoiceRecorderBar
            isRecording={voiceRecorder.isRecording}
            isTranscribing={voiceRecorder.isTranscribing}
            durationFormatted={voiceRecorder.durationFormatted}
            audioLevel={voiceRecorder.audioLevel}
            livePreview={voiceRecorder.livePreview}
            errorMessage={voiceRecorder.errorMessage}
            modeLabel="Dictando mensaje"
            onCancel={voiceRecorder.cancelRecording}
            onStopAndTranscribe={() => voiceRecorder.stopRecording('chat')}
            onClearError={voiceRecorder.clearError}
          />
        ) : (
          /* Normal Input Form with Send / Mic Icon */
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* AI Draft Suggestion Button */}
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={isGeneratingAiDraft}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111b21] hover:bg-slate-700/60 text-emerald-400 border border-emerald-800/60 text-xs font-semibold transition-all disabled:opacity-50 shrink-0 cursor-pointer"
              title="Pedir a Gemini 3.8 Flash que redacte una respuesta recomendada"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAiDraft ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isGeneratingAiDraft ? 'Pensando...' : 'Sugerir con IA'}
              </span>
            </button>

            {/* In-line Quick Mic Dictation Button */}
            <button
              type="button"
              onClick={() => voiceRecorder.startRecording()}
              className="p-2 rounded-lg bg-[#111b21] hover:bg-slate-700/80 text-emerald-400 border border-slate-700 transition-colors shrink-0 cursor-pointer"
              title="Iniciar dictado por voz (MediaRecorder)"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe o presiona el micrófono para dictar..."
              className="flex-1 bg-[#111b21] border border-slate-700/60 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />

            {/* Send or WhatsApp Mic button */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#00a884] text-white hover:bg-emerald-600 transition-colors shrink-0 cursor-pointer"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => voiceRecorder.startRecording()}
                className="p-2 rounded-lg bg-[#00a884] text-white hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer shadow-md"
                title="Dictar mensaje por voz"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </footer>

      {/* Voice Dictation Modal */}
      {showVoiceModal && (
        <VoiceDictationModal
          mode={voiceModalMode}
          targetChatName={chat.name}
          onClose={() => setShowVoiceModal(false)}
          onTranscribeMessage={(transcription) => {
            setInputText((prev) => (prev ? `${prev} ${transcription}` : transcription));
            setTranscribedNotice(`Texto dictado listo para enviar a ${chat.name}`);
            setTimeout(() => setTranscribedNotice(null), 4000);
          }}
          onTranscribeTask={(task) => {
            if (onAddVoiceTask) {
              onAddVoiceTask({
                ...task,
                sourceChatId: chat.id,
                sourceChatName: chat.name,
              });
              setTranscribedNotice(`Tarea "${task.title}" guardada en la agenda`);
              setTimeout(() => setTranscribedNotice(null), 4000);
            }
          }}
        />
      )}

      {/* Quick modal to simulate incoming message from this contact */}
      {showSimulatePrompt && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-slate-700 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">
                Simular Mensaje Entrante de {chat.name}
              </h3>
              <button
                onClick={() => setShowSimulatePrompt(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Escribe lo que este contacto te enviará por WhatsApp para probar cómo la IA responde
              autónomamente y si detecta tareas o deberes en el mensaje:
            </p>

            {/* Quick presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Ejemplos rápidos:</span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setSimulateMessageText(
                      'Hola Edgar, por favor envíame el reporte financiero consolidado antes de mañana a las 11:00 AM.'
                    )
                  }
                  className="text-left p-2 rounded bg-[#202c33] text-slate-200 hover:bg-slate-700/80 transition-colors"
                >
                  "Por favor envíame el reporte financiero antes de mañana a las 11:00 AM."
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSimulateMessageText(
                      '¿Tienes disponibilidad para una reunión este viernes a las 4:00 PM para revisar el contrato?'
                    )
                  }
                  className="text-left p-2 rounded bg-[#202c33] text-slate-200 hover:bg-slate-700/80 transition-colors"
                >
                  "¿Tienes disponibilidad para reunión este viernes a las 4:00 PM?"
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSimulateMessageText(
                      'Hola, buenas tardes. ¿Cuánto cobran por la consultoría y qué métodos de pago aceptan?'
                    )
                  }
                  className="text-left p-2 rounded bg-[#202c33] text-slate-200 hover:bg-slate-700/80 transition-colors"
                >
                  "¿Cuánto cobran por la consultoría y qué métodos de pago aceptan?"
                </button>
              </div>
            </div>

            <form onSubmit={handleTriggerSimulate} className="space-y-3 pt-2">
              <textarea
                rows={3}
                required
                value={simulateMessageText}
                onChange={(e) => setSimulateMessageText(e.target.value)}
                placeholder="Escribe el mensaje entrante aquí..."
                className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulatePrompt(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#00a884] text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Enviar Mensaje Simulado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
