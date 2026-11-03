import React from 'react';
import { 
  MessageSquare, 
  CheckSquare, 
  FlaskConical, 
  QrCode, 
  Settings, 
  Bot, 
  Sparkles,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DeviceConnection } from '../types';

interface NavigationRailProps {
  activeTab: 'chats' | 'tasks' | 'simulator' | 'device' | 'settings';
  setActiveTab: (tab: 'chats' | 'tasks' | 'simulator' | 'device' | 'settings') => void;
  unreadCount: number;
  pendingTasksCount: number;
  autoPilotGlobal: boolean;
  onToggleAutoPilot: () => void;
  device: DeviceConnection;
  onOpenDeviceModal: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  pendingTasksCount,
  autoPilotGlobal,
  onToggleAutoPilot,
  device,
  onOpenDeviceModal,
  audioEnabled,
  onToggleAudio,
}) => {
  return (
    <header className="bg-[#111b21] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 select-none">
      {/* Zone 1: Brand Wordmark & Connection Badge */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100 tracking-tight whitespace-nowrap">
                WhatsApp AI Manager
              </span>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                Auto-Pilot Pro
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <button 
                onClick={onOpenDeviceModal}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Ver estado de vinculación"
              >
                {device.status === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Vinculado: {device.phoneNumber}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span>Sin vincular (Escanear QR)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Links / Workspace Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#202c33] p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'chats'
              ? 'bg-[#00a884] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mensajes & Chats</span>
          {unreadCount > 0 && (
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'tasks'
              ? 'bg-[#00a884] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tareas & Deberes</span>
          {pendingTasksCount > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
              {pendingTasksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'simulator'
              ? 'bg-[#00a884] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Simulador en Vivo</span>
          <span className="text-[10px] text-teal-300 font-mono bg-teal-950/60 px-1 rounded">
            Test
          </span>
        </button>

        <button
          onClick={() => setActiveTab('device')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'device'
              ? 'bg-[#00a884] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Vincular Dispositivo</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-[#00a884] text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Ajustes & IA</span>
        </button>
      </nav>

      {/* Zone 3: Global Auto-Pilot Switch & Audio Quick Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleAudio}
          className="p-2 rounded-lg bg-[#202c33] text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          title={audioEnabled ? 'Sonidos activados' : 'Sonidos silenciados'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Global Auto-Pilot Button */}
        <button
          onClick={onToggleAutoPilot}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            autoPilotGlobal
              ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 shadow-sm hover:bg-emerald-900/60'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${autoPilotGlobal ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span>Auto-Piloto: {autoPilotGlobal ? 'ACTIVO' : 'PAUSADO'}</span>
        </button>
      </div>
    </header>
  );
};
