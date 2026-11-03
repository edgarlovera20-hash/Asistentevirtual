import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Power, 
  CheckCircle2, 
  Sliders, 
  BookOpen, 
  Zap, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Send, 
  Clock, 
  CheckCheck, 
  ShieldCheck, 
  Tag, 
  Layers, 
  RotateCcw,
  UserCheck,
  Check
} from 'lucide-react';
import { ChatbotConfig, ChatbotKnowledgeItem, ChatbotRule, WhatsAppChat } from '../types';

interface ChatbotHubProps {
  config: ChatbotConfig;
  onSaveConfig: (newConfig: ChatbotConfig) => void;
  chats: WhatsAppChat[];
  onToggleChatAutoPilot: (chatId: string) => void;
  onNavigateToChat: (chatId: string) => void;
}

export const ChatbotHub: React.FC<ChatbotHubProps> = ({
  config,
  onSaveConfig,
  chats,
  onToggleChatAutoPilot,
  onNavigateToChat,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'knowledge' | 'rules' | 'test' | 'chats'>('test');
  const [formData, setFormData] = useState<ChatbotConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live Chatbot Testing Sandbox state
  const [sandboxMessages, setSandboxMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
    intent?: string;
    matchedRule?: string;
    latencyMs?: number;
  }>>([
    {
      id: 'welcome-demo',
      sender: 'bot',
      text: config.welcomeMessageText || '¡Hola! 👋 Soy el asistente virtual en WhatsApp. ¿En qué te puedo ayudar hoy?',
      time: 'Ahora',
      intent: 'bienvenida_inicial',
    },
  ]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Knowledge base item editing
  const [editingKbId, setEditingKbId] = useState<string | null>(null);
  const [newKbTopic, setNewKbTopic] = useState('');
  const [newKbContent, setNewKbContent] = useState('');
  const [newKbKeywords, setNewKbKeywords] = useState('');
  const [showAddKbModal, setShowAddKbModal] = useState(false);

  // Rule editing
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleKeywords, setNewRuleKeywords] = useState('');
  const [newRuleReply, setNewRuleReply] = useState('');

  const handleSave = (updated: ChatbotConfig) => {
    setFormData(updated);
    onSaveConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleGlobalBot = () => {
    const updated = { ...formData, enabled: !formData.enabled };
    handleSave(updated);
  };

  // Test sandbox execution
  const handleSendTestMessage = async (textToSend?: string) => {
    const text = (textToSend || sandboxInput).trim();
    if (!text || isBotThinking) return;

    const userMsgId = `test-user-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSandboxMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text,
        time: nowTime,
      },
    ]);
    if (!textToSend) setSandboxInput('');
    setIsBotThinking(true);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/chatbot/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingMessage: text,
          senderName: 'Usuario de Prueba',
          chatHistory: sandboxMessages.slice(-4).map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'ai_assistant',
            content: m.text,
          })),
          botName: formData.botName,
          businessName: formData.businessName,
          assistantTone: formData.assistantTone,
          knowledgeBase: formData.knowledgeBase,
          rules: formData.rules,
          welcomeMessageText: formData.welcomeMessageText,
          fallbackMessage: formData.fallbackMessage,
          systemInstructions: formData.systemInstructions,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        setSandboxMessages((prev) => [
          ...prev,
          {
            id: `test-bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent: data.intent,
            matchedRule: data.matchedRule,
            latencyMs,
          },
        ]);

        // Increment reply count
        const updated = {
          ...formData,
          totalRepliesSent: (formData.totalRepliesSent || 0) + 1,
        };
        setFormData(updated);
        onSaveConfig(updated);
      }
    } catch (err) {
      console.error(err);
      setSandboxMessages((prev) => [
        ...prev,
        {
          id: `test-bot-${Date.now()}`,
          sender: 'bot',
          text: formData.fallbackMessage || 'Hola, he recibido tu mensaje correctamente.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: 'fallback',
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  // Add Knowledge Base Item
  const handleAddKbItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbTopic.trim() || !newKbContent.trim()) return;

    const newItem: ChatbotKnowledgeItem = {
      id: `kb-${Date.now()}`,
      topic: newKbTopic.trim(),
      content: newKbContent.trim(),
      keywords: newKbKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    };

    const updated = {
      ...formData,
      knowledgeBase: [...formData.knowledgeBase, newItem],
    };
    handleSave(updated);
    setNewKbTopic('');
    setNewKbContent('');
    setNewKbKeywords('');
    setShowAddKbModal(false);
  };

  const handleDeleteKbItem = (id: string) => {
    const updated = {
      ...formData,
      knowledgeBase: formData.knowledgeBase.filter((k) => k.id !== id),
    };
    handleSave(updated);
  };

  // Add Rule
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleKeywords.trim()) return;

    const newRule: ChatbotRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName.trim(),
      triggerType: 'keyword',
      keywords: newRuleKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      replyTemplate: newRuleReply.trim() || undefined,
      enabled: true,
    };

    const updated = {
      ...formData,
      rules: [...formData.rules, newRule],
    };
    handleSave(updated);
    setNewRuleName('');
    setNewRuleKeywords('');
    setNewRuleReply('');
    setShowAddRuleModal(false);
  };

  const handleToggleRule = (id: string) => {
    const updated = {
      ...formData,
      rules: formData.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    };
    handleSave(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = {
      ...formData,
      rules: formData.rules.filter((r) => r.id !== id),
    };
    handleSave(updated);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] overflow-hidden select-none">
      {/* 1. Header Banner & Master Control */}
      <div className="bg-[#111b21] border-b border-slate-800 p-3 sm:p-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-slate-100">
                  Chatbot Auto-Respondedor de WhatsApp
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  formData.enabled
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${formData.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{formData.enabled ? 'ACTIVO 24/7' : 'PAUSADO'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Responde mensajes automáticamente sin Meta API ni tokens, usando Gemini 3.8 Flash y tu base de conocimientos.
              </p>
            </div>
          </div>

          {/* Master Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleGlobalBot}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                formData.enabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{formData.enabled ? 'Chatbot Activado' : 'Activar Chatbot'}</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-[#182229]/80 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block font-medium">Respuestas Enviadas</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {formData.totalRepliesSent || 14}
            </span>
          </div>

          <div className="bg-[#182229]/80 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block font-medium">Deberes / Citas Detectadas</span>
            <span className="text-base font-bold text-amber-400 font-mono">
              {formData.totalTasksExtracted || 8}
            </span>
          </div>

          <div className="bg-[#182229]/80 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block font-medium">Temas en Base Conocimiento</span>
            <span className="text-base font-bold text-sky-400 font-mono">
              {formData.knowledgeBase.length}
            </span>
          </div>

          <div className="bg-[#182229]/80 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block font-medium">Reglas de Palabras Clave</span>
            <span className="text-base font-bold text-purple-400 font-mono">
              {formData.rules.filter((r) => r.enabled).length} activas
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="bg-[#182229] border-b border-slate-800 px-3 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
        {[
          { id: 'test', label: 'Probar Chatbot en Vivo', icon: MessageSquare },
          { id: 'settings', label: 'Personalidad & Mensajes', icon: Sliders },
          { id: 'knowledge', label: 'Base de Conocimiento (FAQ)', icon: BookOpen },
          { id: 'rules', label: 'Reglas y Palabras Clave', icon: Zap },
          { id: 'chats', label: 'Gestión por Contacto', icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {saveSuccess && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs font-medium animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Configuración del Chatbot guardada y aplicada a WhatsApp con éxito.</span>
          </div>
        )}

        {/* TAB 1: Live Interactive Testing Sandbox */}
        {activeSubTab === 'test' && (
          <div className="h-full flex flex-col max-w-3xl mx-auto space-y-3">
            <div className="bg-[#111b21] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Simulador de WhatsApp en Vivo
                </span>
                <span className="text-[10px] text-slate-400">
                  (Escribe como si fueras un cliente para comprobar las respuestas)
                </span>
              </div>
              <button
                onClick={() =>
                  setSandboxMessages([
                    {
                      id: 'welcome-demo',
                      sender: 'bot',
                      text: formData.welcomeMessageText,
                      time: 'Ahora',
                      intent: 'bienvenida_inicial',
                    },
                  ])
                }
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-[#202c33]"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reiniciar</span>
              </button>
            </div>

            {/* Quick Test Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[10px] text-slate-400 uppercase font-mono shrink-0">
                Pruebas rápidas:
              </span>
              {[
                '¿Cuáles son sus precios y servicios?',
                'Hola, me gustaría agendar una reunión este viernes',
                '¿Qué horarios de atención tienen?',
                '¿Aceptan transferencia bancaria o tarjeta?',
                'Buenas tardes, necesito una cotización urgente',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTestMessage(chip)}
                  disabled={isBotThinking}
                  className="bg-[#202c33] hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 text-[11px] px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Box */}
            <div className="flex-1 min-h-[340px] bg-[#0b141a] border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-3 relative shadow-inner">
              {sandboxMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#005c4b] text-white rounded-tr-xs'
                          : 'bg-[#202c33] text-slate-100 rounded-tl-xs border border-slate-700/60'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-slate-700/50 text-[10px] text-emerald-400 font-semibold">
                          <Bot className="w-3 h-3" />
                          <span>{formData.botName}</span>
                          {msg.intent && (
                            <span className="ml-auto bg-emerald-950/80 text-emerald-300 px-1.5 py-0.2 rounded text-[9px] font-mono">
                              {msg.intent}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      <div className="flex items-center justify-end gap-1.5 text-[9px] text-slate-400 mt-1 font-mono">
                        {msg.latencyMs && <span>⚡ {msg.latencyMs}ms</span>}
                        {msg.matchedRule && (
                          <span className="text-amber-300">Regla: {msg.matchedRule}</span>
                        )}
                        <span>{msg.time}</span>
                        {isUser && <CheckCheck className="w-3 h-3 text-sky-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isBotThinking && (
                <div className="flex items-center gap-2 p-2 bg-[#202c33] border border-slate-700 rounded-xl w-fit text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-[11px]">
                    {formData.botName} consultando base de conocimientos y redactando...
                  </span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendTestMessage();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                placeholder="Escribe un mensaje de prueba para que el Chatbot responda..."
                className="flex-1 bg-[#111b21] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isBotThinking || !sandboxInput.trim()}
                className="px-4 py-2.5 bg-[#00a884] hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Settings & Personality */}
        {activeSubTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Identidad y Personalidad del Chatbot</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Nombre del Chatbot:</label>
                  <input
                    type="text"
                    value={formData.botName}
                    onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                    className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Empresa / Titular:</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="text-xs text-slate-300 block mb-2">Tono de Comunicación:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { id: 'professional', title: 'Profesional & Ejecutivo', desc: 'Formal, preciso y cordial.' },
                    { id: 'cordial', title: 'Cálido & Amigable', desc: 'Cercano, empático y servicial.' },
                    { id: 'commercial', title: 'Ventas & Asesoría', desc: 'Orientado a cierres y cotizaciones.' },
                    { id: 'concise', title: 'Breve & Conciso', desc: 'Directo al grano en 1-2 frases.' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, assistantTone: t.id as any })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                        formData.assistantTone === t.id
                          ? 'bg-emerald-950/80 border-emerald-500 text-white'
                          : 'bg-[#202c33] border-slate-700 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <span className="font-bold text-xs block">{t.title}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* System prompt */}
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Instrucciones personalizadas del sistema (Prompt para Gemini):
                </label>
                <textarea
                  rows={3}
                  value={formData.systemInstructions}
                  onChange={(e) => setFormData({ ...formData, systemInstructions: e.target.value })}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Instrucciones sobre qué decir, estilo de respuesta, etc."
                />
              </div>
            </div>

            {/* Automated Messages */}
            <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Mensajes Automáticos Clave</span>
              </h3>

              {/* Welcome message */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.welcomeMessageEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, welcomeMessageEnabled: e.target.checked })
                    }
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    Mensaje de Bienvenida Automático (Primer contacto)
                  </span>
                </label>
                <textarea
                  rows={2}
                  disabled={!formData.welcomeMessageEnabled}
                  value={formData.welcomeMessageText}
                  onChange={(e) => setFormData({ ...formData, welcomeMessageText: e.target.value })}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
                  placeholder="¡Hola! Gracias por escribir a..."
                />
              </div>

              {/* Fallback message */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Mensaje de Contingencia / Escalación Humana:
                </label>
                <textarea
                  rows={2}
                  value={formData.fallbackMessage}
                  onChange={(e) => setFormData({ ...formData, fallbackMessage: e.target.value })}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Texto cuando el bot no sabe la respuesta o se solicita hablar con una persona."
                />
              </div>

              {/* Response Delay */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Retardo de simulación de tipeo humano:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {formData.replyDelaySeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={formData.replyDelaySeconds}
                  onChange={(e) =>
                    setFormData({ ...formData, replyDelaySeconds: parseInt(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave(formData)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00a884] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Ajustes de Chatbot</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Knowledge Base (FAQ) */}
        {activeSubTab === 'knowledge' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Base de Conocimientos Oficial (FAQ)
                </h3>
                <p className="text-xs text-slate-400">
                  El Chatbot consulta estos datos para responder con exactitud sobre precios, servicios, horarios y citas sin inventar información.
                </p>
              </div>

              <button
                onClick={() => setShowAddKbModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#00a884] hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nuevo Tema</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {formData.knowledgeBase.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#111b21] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{item.topic}</span>
                      </span>

                      <button
                        onClick={() => handleDeleteKbItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Eliminar tema"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{item.content}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-mono">Palabras clave:</span>
                    {item.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#202c33] text-slate-300 px-1.5 py-0.2 rounded border border-slate-700/60"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for adding Knowledge Base Item */}
            {showAddKbModal && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-[#111b21] border border-slate-700 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">
                      Agregar Tema a la Base de Conocimientos
                    </h4>
                    <button
                      onClick={() => setShowAddKbModal(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>

                  <form onSubmit={handleAddKbItem} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1">Título del Tema:</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Política de Garantía o Envíos"
                        value={newKbTopic}
                        onChange={(e) => setNewKbTopic(e.target.value)}
                        className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">
                        Información y Respuesta Oficial:
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Escribe la información exacta que el bot debe usar para responder a los usuarios..."
                        value={newKbContent}
                        onChange={(e) => setNewKbContent(e.target.value)}
                        className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">
                        Palabras clave asociadas (separadas por coma):
                      </label>
                      <input
                        type="text"
                        placeholder="garantia, devolucion, reembolso, cambio"
                        value={newKbKeywords}
                        onChange={(e) => setNewKbKeywords(e.target.value)}
                        className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddKbModal(false)}
                        className="px-3 py-1.5 text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#00a884] text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors"
                      >
                        Guardar Tema
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Rules & Keywords */}
        {activeSubTab === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Reglas de Disparo por Palabras Clave
                </h3>
                <p className="text-xs text-slate-400">
                  Cuando un mensaje entrante contiene estas palabras, el chatbot activa una respuesta prioritaria inmediata.
                </p>
              </div>

              <button
                onClick={() => setShowAddRuleModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#00a884] hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Regla</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {formData.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-[#111b21] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">{rule.name}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          rule.enabled
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {rule.enabled ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono">Disparadores:</span>
                      {rule.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-[#202c33] text-amber-300 px-1.5 py-0.2 rounded border border-slate-700/60 font-mono"
                        >
                          "{kw}"
                        </span>
                      ))}
                    </div>

                    {rule.replyTemplate && (
                      <p className="text-[11px] text-slate-300 italic bg-[#182229] p-2 rounded-lg border border-slate-800">
                        "{rule.replyTemplate}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        rule.enabled
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {rule.enabled ? 'Pausar' : 'Activar'}
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                      title="Eliminar regla"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for adding Rule */}
            {showAddRuleModal && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-[#111b21] border border-slate-700 rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">
                      Crear Nueva Regla de Disparo
                    </h4>
                    <button
                      onClick={() => setShowAddRuleModal(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>

                  <form onSubmit={handleAddRule} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1">Nombre de la Regla:</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Solicitud de Catálogo"
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">
                        Palabras clave (separadas por coma):
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="catalogo, pdf, productos, lista de precios"
                        value={newRuleKeywords}
                        onChange={(e) => setNewRuleKeywords(e.target.value)}
                        className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">
                        Plantilla de Respuesta Sugerida:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Texto con el que responderá el chatbot..."
                        value={newRuleReply}
                        onChange={(e) => setNewRuleReply(e.target.value)}
                        className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddRuleModal(false)}
                        className="px-3 py-1.5 text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#00a884] text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors"
                      >
                        Guardar Regla
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Manage by Contact */}
        {activeSubTab === 'chats' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Estado del Chatbot por Contacto de WhatsApp
              </h3>
              <p className="text-xs text-slate-400">
                Puedes encender o pausar el chatbot para contactos individuales (por ejemplo, pausarlo para familiares y mantenerlo activo para clientes).
              </p>
            </div>

            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="bg-[#111b21] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0">
                      {chat.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-100 truncate">{chat.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{chat.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigateToChat(chat.id)}
                      className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#202c33] rounded-lg"
                    >
                      Ver Chat
                    </button>

                    <button
                      onClick={() => onToggleChatAutoPilot(chat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                        chat.autoPilotEnabled
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{chat.autoPilotEnabled ? 'Auto-Responde' : 'Manual'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
