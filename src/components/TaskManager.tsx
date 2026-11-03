import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Calendar, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Trash2, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Filter,
  Check,
  Send,
  ExternalLink,
  Mic
} from 'lucide-react';
import { TaskItem, TaskPriority, TaskCategory } from '../types';
import { playTaskCompletedSound } from '../utils/audio';
import { VoiceDictationModal } from './VoiceDictationModal';

interface TaskManagerProps {
  tasks: TaskItem[];
  onToggleTaskStatus: (taskId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToChat: (chatId: string) => void;
  onGenerateBriefing: () => Promise<string | null>;
  isGeneratingBriefing: boolean;
  briefingText: string | null;
  onSendBriefingToWhatsAppSelf: (text: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onToggleTaskStatus,
  onAddTask,
  onDeleteTask,
  onNavigateToChat,
  onGenerateBriefing,
  isGeneratingBriefing,
  briefingText,
  onSendBriefingToWhatsAppSelf,
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newCategory, setNewCategory] = useState<TaskCategory>('work');

  // Stats
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const handleToggle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== 'completed') {
      // Trigger confetti and sound
      playTaskCompletedSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00a884', '#25d366', '#34d399', '#f59e0b'],
      });
    }
    onToggleTaskStatus(taskId);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      dueDate: newDueDate.trim() || 'Hoy',
      priority: newPriority,
      category: newCategory,
      status: 'pending',
    });
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterMode === 'pending') return task.status !== 'completed';
    if (filterMode === 'high') return task.priority === 'high' && task.status !== 'completed';
    if (filterMode === 'client') return task.category === 'client';
    if (filterMode === 'work') return task.category === 'work';
    if (filterMode === 'personal') return task.category === 'personal';
    if (filterMode === 'completed') return task.status === 'completed';
    return true;
  });

  const handleOpenBriefing = async () => {
    setShowBriefingModal(true);
    if (!briefingText) {
      await onGenerateBriefing();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b141a] p-4 md:p-8 space-y-6">
      {/* KPI Header Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111b21] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Deberes Pendientes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {pendingCount}
            </span>
            <span className="text-xs text-slate-400">por resolver</span>
          </div>
        </div>

        <div className="bg-[#111b21] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-red-400 font-medium">Alta Prioridad</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-red-400">
              {highPriorityCount}
            </span>
            <span className="text-xs text-slate-400">urgentes</span>
          </div>
        </div>

        <div className="bg-[#111b21] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-emerald-400 font-medium">Completadas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {completedCount}
            </span>
            <span className="text-xs text-slate-400">finalizadas</span>
          </div>
        </div>

        <div className="bg-[#111b21] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Resumen Matutino</span>
          <button
            onClick={handleOpenBriefing}
            disabled={isGeneratingBriefing}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors mt-2 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingBriefing ? 'Generando...' : 'Resumen con IA'}</span>
          </button>
        </div>
      </div>

      {/* Main Section Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Agenda de Tareas y Deberes</h2>
          <p className="text-xs text-slate-400">
            Tareas extraídas de tus chats de WhatsApp y deberes registrados con recordatorios activos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/80 text-emerald-300 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
            title="Dictar un encargo o tarea con voz usando MediaRecorder"
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Dictar Tarea por Voz</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00a884] hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Tarea Manual</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-[#111b21] p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'pending', label: 'Pendientes' },
          { id: 'high', label: 'Alta Prioridad' },
          { id: 'client', label: 'Clientes' },
          { id: 'work', label: 'Trabajo' },
          { id: 'personal', label: 'Personal' },
          { id: 'completed', label: 'Completadas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === tab.id
                ? 'bg-[#202c33] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#111b21] border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
            <CheckSquare className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-200">No hay tareas en esta categoría</h3>
            <p className="text-xs max-w-sm mx-auto text-slate-400">
              Cuando recibas un mensaje de WhatsApp con un encargo o compromiso, el extractor de IA lo añadirá aquí automáticamente.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`bg-[#111b21] border rounded-xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-slate-800/60 opacity-60 bg-[#111b21]/40'
                    : task.priority === 'high'
                    ? 'border-red-900/40 hover:border-red-700/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left check and title */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-emerald-400 bg-[#202c33]'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority tag */}
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          task.priority === 'high'
                            ? 'bg-red-950/60 text-red-300 border-red-800/60'
                            : task.priority === 'medium'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                        }`}
                      >
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>

                      {/* Category tag */}
                      <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded">
                        {task.category === 'client'
                          ? 'Cliente'
                          : task.category === 'work'
                          ? 'Trabajo'
                          : task.category === 'personal'
                          ? 'Personal'
                          : 'Estudio'}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* WhatsApp origin snippet */}
                    {task.sourceChatName && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp de {task.sourceChatName}</span>
                        </span>
                        {task.sourceSnippet && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-xs italic text-slate-400">
                              "{task.sourceSnippet}"
                            </span>
                          </>
                        )}
                        {task.sourceChatId && (
                          <button
                            onClick={() => onNavigateToChat(task.sourceChatId!)}
                            className="text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer ml-1"
                          >
                            Ver Chat
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Due Date and Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.dueDate || 'Sin fecha límite'}</span>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Manual Task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-slate-700 rounded-xl p-5 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Añadir Nuevo Deber o Tarea</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowVoiceModal(true);
                }}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Dictar por voz</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowVoiceModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>¿Prefieres dictar la tarea por voz? Haz clic aquí</span>
            </button>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Enviar propuesta técnica al cliente"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Descripción o Notas</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales o requerimientos..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Fecha / Hora Límite</label>
                  <input
                    type="text"
                    placeholder="Ej. Hoy 18:00, Mañana 10am"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Prioridad</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="high">Alta (Urgente)</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="work">Trabajo</option>
                  <option value="client">Cliente</option>
                  <option value="personal">Personal</option>
                  <option value="study">Estudio</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#00a884] text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Daily Briefing with Gemini */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-slate-700 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Resumen Ejecutivo de la IA</h3>
              </div>
              <button
                onClick={() => setShowBriefingModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-[#202c33] border border-slate-700 rounded-lg p-4 text-xs text-slate-200 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-sans">
              {isGeneratingBriefing ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span>Gemini 3.8 Flash organizando tus prioridades del día...</span>
                </div>
              ) : (
                briefingText || 'No se pudo generar el resumen.'
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onGenerateBriefing}
                disabled={isGeneratingBriefing}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Regenerar Resumen
              </button>

              <button
                type="button"
                onClick={() => {
                  if (briefingText) {
                    onSendBriefingToWhatsAppSelf(briefingText);
                    setShowBriefingModal(false);
                  }
                }}
                disabled={!briefingText || isGeneratingBriefing}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#00a884] text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar a mi WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Dictation Modal for Tasks */}
      {showVoiceModal && (
        <VoiceDictationModal
          mode="task"
          onClose={() => setShowVoiceModal(false)}
          onTranscribeTask={(newTask) => {
            onAddTask(newTask);
            setShowVoiceModal(false);
          }}
        />
      )}
    </div>
  );
};
