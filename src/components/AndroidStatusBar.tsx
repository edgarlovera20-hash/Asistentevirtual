import React, { useState, useEffect } from 'react';
import { Wifi, Battery, MessageSquare, Bot } from 'lucide-react';

interface AndroidStatusBarProps {
  batteryLevel?: number;
  hasUnread?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  batteryLevel = 92,
  hasUnread = false,
}) => {
  const [timeStr, setTimeStr] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-7 bg-[#182229] text-slate-300 px-4 flex items-center justify-between text-[11px] font-mono select-none shrink-0 border-b border-slate-800/40">
      {/* Left: Time and Notification Icons */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-100">{timeStr}</span>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Bot className="w-3 h-3" />
          {hasUnread && <MessageSquare className="w-3 h-3 fill-emerald-400" />}
        </div>
      </div>

      {/* Center Camera Punch-hole (simulated) */}
      <div className="w-3 h-3 rounded-full bg-black border border-slate-800 mx-auto hidden sm:block" />

      {/* Right: Network and Battery */}
      <div className="flex items-center gap-2 text-slate-300">
        <span className="text-[10px] font-bold">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-1">
          <span className="text-[10px]">{batteryLevel}%</span>
          <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
        </div>
      </div>
    </div>
  );
};
