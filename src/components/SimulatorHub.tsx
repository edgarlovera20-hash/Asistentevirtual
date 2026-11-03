import React, { useState } from 'react';
import { 
  FlaskConical, 
  Send, 
  Bot, 
  CheckSquare, 
  Zap, 
  Sparkles, 
  MessageSquare,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { WhatsAppChat } from '../types';

interface SimulatorHubProps {
  chats: WhatsAppChat[];
  onTriggerSimulation: (chatId: string, message: string) => Promise<void>;
  isSimulating: boolean;
  simulationLog: Array<{
    id: string;
    time: string;
    senderName: string;
    incoming: string;
    reply?: string;
    extractedTasks?: string[];
  }>;
}

export const SimulatorHub: React.FC<SimulatorHubProps> = ({
  chats,
  onTriggerSimulation,
  isSimulating,
  simulationLog,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string>(chats[0]?.id || '');
  const [customSenderName, setCustomSenderName] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');

  const presetScenarios = [
    {
      title: 'Cotización con Fecha Límite Estricta',
      text: 'Hola Edgar, por favor envíame la cotización revisada para el proyecto antes de mañana a las 2:00 PM. Es requisito indispensable para el cierre.',
      badge: 'Tarea Urgente',
    },
    {
      title: 'Reunión de Negocios y Disponibilidad',
      text: 'Estimado, ¿tendrás disponibilidad este viernes a las 11:00 AM para una videollamada de 30 minutos sobre la consultoría técnica?',
      badge: 'Cita / Reunión',
    },
    {
      title: 'Pago de Servicios y Compromiso Administrativo',
      text: 'Acuérdate de pagar el hosting del servidor y transferir el pago de los proveedores antes del jueves en la tarde.',
      badge: 'Deber Financiero',
    },
    {
      title: 'Consulta General de Tarifas y Precios',
      text: 'Buenas tardes, me gustaría saber qué planes y costos manejan para proyectos de desarrollo a medida.',
      badge: 'Consulta Comercial',
    },
    {
      title: 'Saludo Casual (Sin tareas ni deberes)',
      text: '¡Hola amigo! ¿Cómo has estado? Espero que todo marche excelente por allá.',
      badge: 'Casual (0 tareas)',
    },
  ];

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedChatId) return;

    await onTriggerSimulation(selectedChatId, messageText.trim());
    setMessageText('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b141a] p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-slate-100">Laboratorio y Simulador de WhatsApp</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Prueba en tiempo real cómo tu asistente de WhatsApp procesa mensajes entrantes, responde de manera autónoma y extrae deberes a tu agenda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Message Injector */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Configurar Mensaje Simulado
            </h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Contacto que envía el mensaje:
              </label>
              <select
                value={selectedChatId}
                onChange={(e) => setSelectedChatId(e.target.value)}
                className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {chats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phoneNumber}) {c.autoPilotEnabled ? '• [Auto-Pilot ON]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick preset selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">
                O selecciona un escenario de prueba predefinido:
              </label>
              <div className="space-y-2">
                {presetScenarios.map((scenario, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageText(scenario.text)}
                    className="w-full text-left p-2.5 rounded-lg bg-[#202c33] hover:bg-slate-700/60 border border-slate-700/60 transition-colors text-xs space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{scenario.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        {scenario.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">"{scenario.text}"</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Message input */}
            <form onSubmit={handleRunSimulation} className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Texto del mensaje entrante:
                </label>
                <textarea
                  rows={3}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe lo que el contacto te enviará por WhatsApp..."
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating || !messageText.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00a884] hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Gemini analizando, respondiendo y extrayendo tareas...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Disparar Simulación de WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Area: Live Pipeline & Activity Feed */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Registro de Ejecución en Vivo (Pipeline)</span>
            </h3>

            {simulationLog.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bot className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">
                  Aún no has ejecutado simulaciones en esta sesión. Selecciona un escenario a la izquierda para probar.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {simulationLog.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#202c33] border border-slate-700/80 rounded-xl p-3.5 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                      <span>De: {log.senderName}</span>
                      <span>{log.time}</span>
                    </div>

                    {/* Step 1: Received */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">
                        1. Mensaje recibido
                      </span>
                      <p className="p-2 bg-[#111b21] rounded-lg text-slate-200 italic">
                        "{log.incoming}"
                      </p>
                    </div>

                    {/* Step 2: Extracted Tasks */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-400 uppercase font-mono font-semibold flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        <span>2. Deberes y tareas extraídas</span>
                      </span>
                      {log.extractedTasks && log.extractedTasks.length > 0 ? (
                        <ul className="space-y-1">
                          {log.extractedTasks.map((t, i) => (
                            <li
                              key={i}
                              className="p-1.5 bg-emerald-950/40 border border-emerald-800/40 rounded text-emerald-300 font-medium text-[11px]"
                            >
                              ✓ {t}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          (Sin tareas detectadas en este mensaje)
                        </p>
                      )}
                    </div>

                    {/* Step 3: Autonomous Auto-Reply */}
                    {log.reply && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-400 uppercase font-mono font-semibold flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          <span>3. Respuesta autónoma enviada por WhatsApp</span>
                        </span>
                        <p className="p-2 bg-[#005c4b]/80 border border-emerald-500/40 rounded-lg text-white">
                          {log.reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
