import React, { useState } from 'react';
import { 
  Settings, 
  Bot, 
  Save, 
  Check, 
  Key, 
  Clock, 
  Volume2, 
  Sliders, 
  FileText,
  ShieldCheck,
  Building,
  QrCode
} from 'lucide-react';
import { AssistantSettings } from '../types';

interface SettingsPanelProps {
  settings: AssistantSettings;
  onSaveSettings: (newSettings: AssistantSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AssistantSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b141a] p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Ajustes y Configuración del Asistente IA
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personaliza el comportamiento, tono de respuesta, contexto de tus actividades y reglas de autonomía para WhatsApp.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-medium animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Ajustes guardados correctamente</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Section 1: Personality & Tone */}
        <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bot className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-100">
              Personalidad y Tono de Auto-Respuesta
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'professional',
                title: 'Profesional & Cordial (Recomendado)',
                desc: 'Educado, altamente eficiente y enfocado en resolver consultas y agendar compromisos con formalidad impecable.',
              },
              {
                id: 'cordial',
                title: 'Cálido & Amigable',
                desc: 'Cercano, empático y servicial, ideal para atención personalizada o trato con clientes frecuentes.',
              },
              {
                id: 'concise',
                title: 'Breve & Directo al Grano',
                desc: 'Respuestas ultra concisas sin preámbulos, enfocado en dar datos precisos y confirmar recepción en 1 o 2 oraciones.',
              },
            ].map((tone) => (
              <label
                key={tone.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.assistantTone === tone.id
                    ? 'bg-[#202c33] border-emerald-500 text-white shadow-sm'
                    : 'bg-[#182229]/50 border-slate-700/80 text-slate-300 hover:bg-[#202c33]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{tone.title}</span>
                    <input
                      type="radio"
                      name="tone"
                      value={tone.id}
                      checked={formData.assistantTone === tone.id}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          assistantTone: tone.id as 'professional' | 'cordial' | 'concise',
                        })
                      }
                      className="accent-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tone.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Tu Nombre o Marca en WhatsApp:
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Tu Título o Cargo:
              </label>
              <input
                type="text"
                value={formData.ownerTitle}
                onChange={(e) => setFormData({ ...formData, ownerTitle: e.target.value })}
                className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Business & Personal Context */}
        <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-100">
              Contexto de Trabajo, Servicios y Reglas del Titular
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            Esta información es utilizada por Gemini 3.8 Flash para responder con datos precisos sobre tus servicios, tarifas, datos de cobro, horarios y procedimientos sin inventar datos:
          </p>

          <textarea
            rows={5}
            value={formData.userContext}
            onChange={(e) => setFormData({ ...formData, userContext: e.target.value })}
            className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-y leading-relaxed font-sans"
            placeholder="Describe tus servicios, horarios de atención, formas de pago, cómo agendar citas, etc."
          />
        </div>

        {/* Section 3: Task Detection & Audio Automation */}
        <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-100">
              Automatizaciones y Detección de Deberes
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-[#202c33]/70 hover:bg-[#202c33] transition-colors">
              <input
                type="checkbox"
                checked={formData.autoExtractTasks}
                onChange={(e) => setFormData({ ...formData, autoExtractTasks: e.target.checked })}
                className="mt-0.5 accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-xs text-slate-100 block">
                  Extracción Inteligente de Deberes y Tareas en Chats
                </span>
                <span className="text-[11px] text-slate-400">
                  Analiza automáticamente cada mensaje entrante para detectar solicitudes urgentes, fechas límite y recordatorios, agregándolos a tu agenda.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-[#202c33]/70 hover:bg-[#202c33] transition-colors">
              <input
                type="checkbox"
                checked={formData.enableAudioAlerts}
                onChange={(e) => setFormData({ ...formData, enableAudioAlerts: e.target.checked })}
                className="mt-0.5 accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-xs text-slate-100 block">
                  Alertas Sonoras Sintetizadas
                </span>
                <span className="text-[11px] text-slate-400">
                  Reproduce un timbre sutil al recibir mensajes, enviar auto-respuestas o registrar un nuevo deber prioritario.
                </span>
              </div>
            </label>

            <div className="p-3 rounded-lg bg-[#202c33]/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-100">
                  Retardo de simulación de respuesta humana:
                </span>
                <span className="font-mono text-xs text-emerald-400">
                  {formData.replyDelaySeconds} segundos
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={formData.replyDelaySeconds}
                onChange={(e) =>
                  setFormData({ ...formData, replyDelaySeconds: parseInt(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Permite que la respuesta no se envíe al instante de 0ms para simular un tiempo de lectura natural.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Direct WhatsApp Companion (Personal & Business) */}
        <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-slate-100">
                Conexión Directa Multi-Dispositivo (Sin Meta API ni Tokens)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
              WhatsApp Normal & Business
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Esta aplicación opera de forma 100% independiente como <strong>dispositivo complementario vinculado</strong> (similar a WhatsApp Web). No requiere Meta Business API, ni cuenta de desarrollador, ni tokens de pago. Funciona con cualquier cuenta de WhatsApp en tu teléfono Android.
          </p>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-[#202c33]/70 hover:bg-[#202c33] transition-colors">
              <input
                type="checkbox"
                checked={formData.linkedDeviceConfig?.keepSessionAlive ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linkedDeviceConfig: {
                      ...formData.linkedDeviceConfig,
                      keepSessionAlive: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-xs text-slate-100 block">
                  Mantener Sincronización en Segundo Plano (Keep-Alive)
                </span>
                <span className="text-[11px] text-slate-400">
                  Mantiene el socket activo para procesar mensajes entrantes y extraer deberes continuamente aunque cierres la pestaña.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-[#202c33]/70 hover:bg-[#202c33] transition-colors">
              <input
                type="checkbox"
                checked={formData.linkedDeviceConfig?.allowGroupAutoReplies ?? false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linkedDeviceConfig: {
                      ...formData.linkedDeviceConfig,
                      allowGroupAutoReplies: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-xs text-slate-100 block">
                  Permitir Auto-Respuestas en Grupos de WhatsApp
                </span>
                <span className="text-[11px] text-slate-400">
                  Desactivado por defecto para evitar saturar grupos de amigos o trabajo con respuestas automáticas.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-[#202c33]/70 hover:bg-[#202c33] transition-colors">
              <input
                type="checkbox"
                checked={formData.linkedDeviceConfig?.autoReplyUnknownNumbersOnly ?? false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linkedDeviceConfig: {
                      ...formData.linkedDeviceConfig,
                      autoReplyUnknownNumbersOnly: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-xs text-slate-100 block">
                  Auto-Responder Solo a Números Nuevos / Desconocidos
                </span>
                <span className="text-[11px] text-slate-400">
                  Si se activa, el bot responderá de inmediato a nuevos prospectos o números no registrados, dejando los chats personales para ti.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00a884] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
