import React, { useState } from 'react';
import { 
  Mic, 
  Square, 
  Trash2, 
  Check, 
  Sparkles, 
  AlertCircle,
  X,
  Volume2,
  Calendar,
  Send,
  CheckCircle2,
  RefreshCw,
  Clock,
  Tag
} from 'lucide-react';
import { useVoiceRecorder } from '../utils/useVoiceRecorder';
import { TaskItem, TaskPriority, TaskCategory } from '../types';

interface VoiceDictationModalProps {
  mode: 'chat' | 'task';
  targetChatName?: string;
  onClose: () => void;
  onTranscribeMessage?: (text: string) => void;
  onTranscribeTask?: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  mode,
  targetChatName,
  onClose,
  onTranscribeMessage,
  onTranscribeTask,
}) => {
  const [transcribedResult, setTranscribedResult] = useState<string>('');
  const [structuredTask, setStructuredTask] = useState<any>(null);

  // Editable task form fields after transcription
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('Hoy');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('work');

  const voiceRecorder = useVoiceRecorder({
    onTranscriptionComplete: (text, structured) => {
      setTranscribedResult(text);
      if (structured) {
        setStructuredTask(structured);
        setTaskTitle(structured.title || text);
        setTaskDescription(structured.description || text);
        setTaskDueDate(structured.dueDate || 'Hoy');
        setTaskPriority(structured.priority || 'medium');
        setTaskCategory(structured.category || 'work');
      } else {
        setTaskTitle(text.slice(0, 60));
        setTaskDescription(text);
      }
    },
  });

  const handleStart = async () => {
    setTranscribedResult('');
    setStructuredTask(null);
    await voiceRecorder.startRecording();
  };

  const handleStop = async () => {
    await voiceRecorder.stopRecording(mode);
  };

  const handleConfirmMessage = () => {
    if (!transcribedResult.trim()) return;
    onTranscribeMessage?.(transcribedResult.trim());
    onClose();
  };

  const handleConfirmTask = () => {
    if (!taskTitle.trim()) return;
    onTranscribeTask?.({
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      dueDate: taskDueDate.trim() || 'Hoy',
      priority: taskPriority,
      category: taskCategory,
      status: 'pending',
      sourceChatName: targetChatName || 'Dictado por voz',
      sourceSnippet: transcribedResult.slice(0, 80),
    });
    onClose();
  };

  // Preset voice dictation ideas
  const taskExamples = [
    '"Reunión mañana a las 3pm con Carlos para revisar el contrato"',
    '"Pagar la factura de internet antes del viernes urgente"',
    '"Enviar propuesta comercial a Sofía antes de las 6"',
  ];

  const chatExamples = [
    '"Hola, ya revisé el archivo y todo está correcto. Te lo envío en 10 minutos."',
    '"Estoy en una reunión ahora mismo, te marco en cuanto me desocupe."',
    '"Confirmada la cita de mañana a las 11. Saludos cordiales."',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111b21] border border-slate-700/80 rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {mode === 'task' ? 'Dictar Deber o Tarea por Voz' : 'Dictar Mensaje de WhatsApp'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'task'
                  ? 'Di tu encargo y Gemini extraerá título, fecha límite y prioridad'
                  : targetChatName
                  ? `Dicta la respuesta para ${targetChatName}`
                  : 'Dicta tu respuesta rápida con puntuación automática'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              voiceRecorder.cancelRecording();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recording Visualizer Area */}
        <div className="bg-[#202c33]/70 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          {voiceRecorder.errorMessage ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-950/80 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-red-300 max-w-xs mx-auto">
                {voiceRecorder.errorMessage}
              </p>
              <button
                onClick={handleStart}
                className="px-4 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : voiceRecorder.isTranscribing ? (
            <div className="py-6 space-y-3">
              <div className="w-12 h-12 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-emerald-300 animate-pulse">
                  Gemini está transcribiendo y formateando tu audio...
                </p>
                <p className="text-[11px] text-slate-400">
                  Aplicando puntuación natural, acentos y detección de tareas
                </p>
              </div>
            </div>
          ) : voiceRecorder.isRecording ? (
            <div className="py-2 space-y-4 w-full">
              {/* Pulsing Mic Circle */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <span 
                  className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
                  style={{ animationDuration: '1.4s' }}
                />
                <div 
                  className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform duration-75"
                  style={{ transform: `scale(${1 + voiceRecorder.audioLevel * 0.003})` }}
                >
                  <Mic className="w-7 h-7" />
                </div>
              </div>

              {/* Timer and Waveform */}
              <div className="space-y-2">
                <div className="text-base font-mono font-bold text-red-400 tabular-nums">
                  {voiceRecorder.durationFormatted}
                </div>
                
                {/* Visualizer bars */}
                <div className="flex items-center justify-center gap-1.5 h-8">
                  {[20, 45, 70, 95, 60, 30, 85, 40, 65, 30].map((base, idx) => {
                    const dynamicHeight = Math.min(32, Math.max(8, (voiceRecorder.audioLevel * base) / 70));
                    return (
                      <div
                        key={idx}
                        className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${dynamicHeight}px` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Live Preview / Speaking instructions */}
              {voiceRecorder.livePreview ? (
                <div className="bg-[#111b21] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 italic max-w-sm mx-auto">
                  "{voiceRecorder.livePreview}"
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Escuchando... Habla ahora con claridad.
                </p>
              )}

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={voiceRecorder.cancelRecording}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Detener y Transcribir</span>
                </button>
              </div>
            </div>
          ) : transcribedResult ? (
            <div className="w-full text-left space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Audio Transcrito Exitosamente</span>
                </span>
                <button
                  onClick={handleStart}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Volver a grabar</span>
                </button>
              </div>

              <div className="bg-[#111b21] border border-emerald-500/30 rounded-xl p-3 text-xs text-slate-100 leading-relaxed font-sans select-text">
                "{transcribedResult}"
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <button
                type="button"
                onClick={handleStart}
                className="w-16 h-16 rounded-full bg-[#00a884] hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center mx-auto shadow-xl transition-all cursor-pointer group"
                title="Comenzar a grabar dictado"
              >
                <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </button>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-200">
                  Presiona el micrófono para comenzar a dictar
                </p>
                <p className="text-[11px] text-slate-400">
                  Usa la API MediaRecorder del navegador para capturar audio de alta fidelidad
                </p>
              </div>

              {/* Dictation Example Inspirations */}
              <div className="pt-2 text-left bg-[#111b21] border border-slate-800 rounded-xl p-3 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  Ejemplos que puedes dictar:
                </span>
                <div className="space-y-1">
                  {(mode === 'task' ? taskExamples : chatExamples).map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTranscribedResult(example.replace(/^"|"$/g, ''));
                        if (mode === 'task') {
                          setTaskTitle(example.replace(/^"|"$/g, '').slice(0, 50));
                          setTaskDescription(example.replace(/^"|"$/g, ''));
                          setTaskDueDate('Hoy');
                        }
                      }}
                      className="w-full text-left text-[11px] text-slate-300 hover:text-emerald-300 p-1.5 rounded hover:bg-slate-800/80 transition-colors truncate block"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task Form Review (if in task mode and transcribed) */}
        {mode === 'task' && transcribedResult && !voiceRecorder.isRecording && !voiceRecorder.isTranscribing && (
          <div className="space-y-3 bg-[#111b21] border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-200 block">
              Detalles de la tarea extraídos:
            </span>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Título</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Fecha Límite</label>
                <input
                  type="text"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Prioridad</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Categoría</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="work">Trabajo</option>
                  <option value="client">Cliente</option>
                  <option value="personal">Personal</option>
                  <option value="study">Estudio</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              voiceRecorder.cancelRecording();
              onClose();
            }}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Cerrar
          </button>

          {transcribedResult && !voiceRecorder.isRecording && !voiceRecorder.isTranscribing && (
            <button
              type="button"
              onClick={mode === 'task' ? handleConfirmTask : handleConfirmMessage}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00a884] hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {mode === 'task' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Añadir Tarea Dictada</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Usar Transcripción en el Chat</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
