import React, { useState } from 'react';
import { Search, Pin, Bot, Plus, CheckCheck, Check, MessageSquareDashed } from 'lucide-react';
import { WhatsAppChat } from '../types';

interface ChatListProps {
  chats: WhatsAppChat[];
  selectedChatId: string;
  onSelectChat: (chatId: string) => void;
  onAddNewChat: (name: string, phone: string, initialMessage?: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onAddNewChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'autopilot'>('all');
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactMsg, setNewContactMsg] = useState('');

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.phoneNumber.includes(searchTerm) ||
      chat.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'unread') return chat.unreadCount > 0;
    if (filterMode === 'autopilot') return chat.autoPilotEnabled;
    return true;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    onAddNewChat(
      newContactName.trim(),
      newContactPhone.trim() || '+54 9 11 ' + Math.floor(10000000 + Math.random() * 90000000),
      newContactMsg.trim()
    );
    setNewContactName('');
    setNewContactPhone('');
    setNewContactMsg('');
    setShowNewContactModal(false);
  };

  return (
    <aside className="w-80 md:w-96 bg-[#111b21] border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* Search and Action Bar */}
      <div className="p-3 border-b border-slate-800/80 space-y-2.5 bg-[#111b21]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Conversaciones</h2>
          <button
            onClick={() => setShowNewContactModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Chat</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar contacto o mensaje..."
            className="w-full bg-[#202c33] border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#202c33] rounded-lg text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-slate-700/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({chats.length})
          </button>
          <button
            onClick={() => setFilterMode('unread')}
            className={`flex-1 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'unread'
                ? 'bg-slate-700/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            No leídos
          </button>
          <button
            onClick={() => setFilterMode('autopilot')}
            className={`flex-1 py-1 rounded-md font-medium transition-colors flex items-center justify-center gap-1 ${
              filterMode === 'autopilot'
                ? 'bg-slate-700/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3 h-3 text-emerald-400" />
            <span>Auto-Pilot</span>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <MessageSquareDashed className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
            <p className="text-xs">No se encontraron conversaciones coincidentes.</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = chat.id === selectedChatId;
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left p-3 flex items-start gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2a3942]'
                    : 'hover:bg-[#202c33]/70 bg-transparent'
                }`}
              >
                {/* Contact Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-slate-700 overflow-hidden border border-slate-600/60 flex items-center justify-center text-slate-300 font-bold text-sm">
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
                  {chat.autoPilotEnabled && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-600 border border-[#111b21] flex items-center justify-center text-white"
                      title="Auto-Pilot activo para este chat"
                    >
                      <Bot className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-xs text-slate-100 truncate">
                      {chat.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {chat.lastMessage.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-300 truncate flex items-center gap-1">
                      {chat.lastMessage.sender === 'user' && (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      )}
                      {chat.lastMessage.sender === 'ai_assistant' && (
                        <span className="text-[10px] text-emerald-400 font-semibold shrink-0">
                          [IA]:
                        </span>
                      )}
                      <span className="truncate">{chat.lastMessage.content}</span>
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      {chat.isPinned && (
                        <Pin className="w-3 h-3 text-slate-400 fill-slate-400" />
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="bg-[#00a884] text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {chat.roleDescription && (
                    <div className="mt-1 text-[10px] text-slate-400 truncate">
                      {chat.roleDescription}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Modal for Creating New Contact / Starting Chat */}
      {showNewContactModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-slate-700 rounded-xl p-5 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100">Iniciar Nuevo Chat de WhatsApp</h3>
            <form onSubmit={handleCreateContact} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nombre o Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Martínez"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Número de Teléfono</label>
                <input
                  type="text"
                  placeholder="+54 9 11 5544-3322"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Mensaje Inicial (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Hola Edgar, ¿puedes enviarme el presupuesto del proyecto?"
                  value={newContactMsg}
                  onChange={(e) => setNewContactMsg(e.target.value)}
                  className="w-full bg-[#202c33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewContactModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#00a884] text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Crear y Abrir Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
