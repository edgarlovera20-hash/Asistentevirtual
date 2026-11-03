import React from 'react';
import { MessageSquare, Bot, CheckSquare, FlaskConical, QrCode, Settings } from 'lucide-react';
import { NavigationTab } from '../types';

interface AndroidBottomNavProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  unreadCount: number;
  pendingTasksCount: number;
  chatbotEnabled?: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  pendingTasksCount,
  chatbotEnabled = true,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  };

  const navItems = [
    {
      id: 'chats' as const,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      id: 'chatbot' as const,
      label: 'Chatbot',
      icon: Bot,
      isBot: true,
      badge: chatbotEnabled ? 'ON' : null,
    },
    {
      id: 'tasks' as const,
      label: 'Tareas',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
    },
    {
      id: 'simulator' as const,
      label: 'Simulador',
      icon: FlaskConical,
      badge: null,
    },
    {
      id: 'device' as const,
      label: 'Vincular',
      icon: QrCode,
      badge: null,
    },
    {
      id: 'settings' as const,
      label: 'Ajustes',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav className="h-16 bg-[#182229] border-t border-slate-800/80 flex items-center justify-around px-2 select-none shrink-0 z-30">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              triggerHaptic();
              setActiveTab(item.id);
            }}
            className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center relative transition-transform active:scale-95 cursor-pointer ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Active Pill highlight behind icon */}
            <div
              className={`px-4 py-1 rounded-full transition-colors relative ${
                isActive ? 'bg-emerald-950/80 text-emerald-400' : 'bg-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />

              {/* Badge Counter */}
              {item.badge !== null && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-mono shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] tracking-tight mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
