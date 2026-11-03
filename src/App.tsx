/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidTopBar } from './components/AndroidTopBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AndroidNavigationBar } from './components/AndroidNavigationBar';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { TaskManager } from './components/TaskManager';
import { SimulatorHub } from './components/SimulatorHub';
import { DevicePairingModal } from './components/DevicePairingModal';
import { SettingsPanel } from './components/SettingsPanel';
import { VoiceDictationModal } from './components/VoiceDictationModal';
import { ChatbotHub } from './components/ChatbotHub';
import { 
  WhatsAppChat, 
  WhatsAppMessage, 
  TaskItem, 
  AssistantSettings, 
  DeviceConnection,
  ChatbotConfig,
  NavigationTab 
} from './types';
import { 
  initialChats, 
  initialMessages, 
  initialTasks, 
  initialSettings, 
  initialDeviceConnection,
  initialChatbotConfig 
} from './utils/mockData';
import { 
  playIncomingMessageSound, 
  playSentMessageSound, 
  playTaskCreatedSound 
} from './utils/audio';
import { usePWAInstall } from './utils/usePWAInstall';
import { 
  CheckCircle2, 
  Sparkles, 
  X, 
  Plus, 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  Download,
  Share2
} from 'lucide-react';

export default function App() {
  // Persistence state with defensive try/catch
  const [chats, setChats] = useState<WhatsAppChat[]>(() => {
    try {
      const saved = localStorage.getItem('wa_chats');
      return saved ? JSON.parse(saved) : initialChats;
    } catch {
      return initialChats;
    }
  });

  const [messages, setMessages] = useState<Record<string, WhatsAppMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('wa_messages');
      return saved ? JSON.parse(saved) : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('wa_tasks');
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [settings, setSettings] = useState<AssistantSettings>(() => {
    try {
      const saved = localStorage.getItem('wa_settings');
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [device, setDevice] = useState<DeviceConnection>(() => {
    try {
      const saved = localStorage.getItem('wa_device');
      return saved ? JSON.parse(saved) : initialDeviceConnection;
    } catch {
      return initialDeviceConnection;
    }
  });

  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>(() => {
    try {
      const saved = localStorage.getItem('wa_chatbot_config');
      return saved ? JSON.parse(saved) : initialChatbotConfig;
    } catch {
      return initialChatbotConfig;
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<NavigationTab>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string>(chats[0]?.id || 'chat-1');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(false);
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [showGlobalVoiceModal, setShowGlobalVoiceModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ title: string; subtitle?: string } | null>(null);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [simulationLog, setSimulationLog] = useState<Array<{
    id: string;
    time: string;
    senderName: string;
    incoming: string;
    reply?: string;
    extractedTasks?: string[];
  }>>([]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('wa_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('wa_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('wa_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('wa_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('wa_device', JSON.stringify(device));
  }, [device]);

  useEffect(() => {
    localStorage.setItem('wa_chatbot_config', JSON.stringify(chatbotConfig));
  }, [chatbotConfig]);

  // Derived metrics
  const unreadCount = chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const currentChat = chats.find((c) => c.id === selectedChatId) || chats[0];
  const currentChatMessages = messages[selectedChatId] || [];

  const showToast = (title: string, subtitle?: string) => {
    setToastNotification({ title, subtitle });
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // 1. Send Manual Message from User
  const handleSendMessage = (chatId: string, content: string) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      chatId,
      sender: 'user',
      content,
      timestamp: timeFormatted,
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, lastMessage: newMsg }
          : c
      )
    );

    if (settings.enableAudioAlerts) {
      playSentMessageSound();
    }
  };

  // 2. Core Incoming WhatsApp Message Pipeline (Auto-reply + Task Extraction)
  const handleProcessIncomingMessage = async (
    chatId: string, 
    content: string
  ): Promise<{ reply?: string; extractedTaskTitles: string[] }> => {
    const chat = chats.find((c) => c.id === chatId);
    const senderName = chat ? chat.name : 'Contacto';
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step A: Register incoming message in chat
    const incomingMsg: WhatsAppMessage = {
      id: `msg-in-${Date.now()}`,
      chatId,
      sender: 'contact',
      content,
      timestamp: timeFormatted,
      status: 'read',
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), incomingMsg],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: incomingMsg,
              unreadCount: activeTab === 'chats' && mobileChatOpen && selectedChatId === chatId ? 0 : c.unreadCount + 1,
            }
          : c
      )
    );

    if (settings.enableAudioAlerts) {
      playIncomingMessageSound();
    }

    const extractedTaskTitles: string[] = [];

    // Step B: Intelligent Task Extraction with Gemini 3.8 Flash
    if (settings.autoExtractTasks) {
      try {
        const response = await fetch('/api/assistant/extract-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            senderName,
            currentDateTime: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasTasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
            const newTasks: TaskItem[] = data.tasks.map((t: any, index: number) => ({
              id: `task-${Date.now()}-${index}`,
              title: t.title,
              description: t.description || undefined,
              dueDate: t.dueDate || 'Sin fecha fija',
              priority: t.priority || 'medium',
              category: t.category || 'work',
              status: 'pending',
              sourceChatId: chatId,
              sourceChatName: senderName,
              sourceSnippet: content.slice(0, 100),
              createdAt: `Hoy, ${timeFormatted}`,
            }));

            setTasks((prev) => [...newTasks, ...prev]);
            newTasks.forEach((nt) => extractedTaskTitles.push(nt.title));

            if (settings.enableAudioAlerts) {
              playTaskCreatedSound();
            }

            showToast(
              `Nueva tarea detectada: ${newTasks[0].title}`,
              `Extraída automáticamente del WhatsApp de ${senderName}`
            );
          }
        }
      } catch (err) {
        console.error('Error running extract-tasks:', err);
      }
    }

    // Step C: Autonomous Chatbot Auto-Reply Engine
    let autonomousReplyText: string | undefined;

    const isAutoPilotActiveForThisChat =
      chatbotConfig.enabled &&
      settings.autoPilotGlobal &&
      (chat?.autoPilotEnabled ?? true);

    if (isAutoPilotActiveForThisChat) {
      // Simulate typing state
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isTyping: true } : c))
      );

      // Delay to simulate human reading/typing
      const delayMs = Math.max(1200, (chatbotConfig.replyDelaySeconds || 2) * 1000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      try {
        const isFirstMessage = (messages[chatId]?.length || 0) <= 1;

        const replyRes = await fetch('/api/chatbot/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incomingMessage: content,
            senderName,
            chatHistory: messages[chatId] || [],
            botName: chatbotConfig.botName,
            businessName: chatbotConfig.businessName || settings.ownerName,
            assistantTone: chatbotConfig.assistantTone,
            knowledgeBase: chatbotConfig.knowledgeBase,
            rules: chatbotConfig.rules,
            welcomeMessageText: chatbotConfig.welcomeMessageEnabled ? chatbotConfig.welcomeMessageText : '',
            isFirstMessage,
            fallbackMessage: chatbotConfig.fallbackMessage,
            systemInstructions: chatbotConfig.systemInstructions || settings.userContext,
          }),
        });

        if (replyRes.ok) {
          const replyData = await replyRes.json();
          autonomousReplyText = replyData.reply;

          const aiReplyMsg: WhatsAppMessage = {
            id: `msg-ai-${Date.now()}`,
            chatId,
            sender: 'ai_assistant',
            content: replyData.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
            isAutonomousReply: true,
            detectedIntent: replyData.intent,
            suggestedAction: replyData.suggestedAction,
          };

          setMessages((prev) => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), aiReplyMsg],
          }));

          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? { ...c, lastMessage: aiReplyMsg, isTyping: false }
                : c
            )
          );

          // Update chatbot metrics
          setChatbotConfig((prev) => ({
            ...prev,
            totalRepliesSent: (prev.totalRepliesSent || 0) + 1,
            totalTasksExtracted: (prev.totalTasksExtracted || 0) + extractedTaskTitles.length,
          }));

          if (settings.enableAudioAlerts) {
            playSentMessageSound();
          }

          showToast(
            `🤖 ${chatbotConfig.botName} respondió automáticamente`,
            `A ${senderName}: "${replyData.reply.slice(0, 48)}..."`
          );
        }
      } catch (err) {
        console.error('Error in chatbot auto-reply:', err);
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, isTyping: false } : c))
        );
      }
    } else {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isTyping: false } : c))
      );
    }

    return {
      reply: autonomousReplyText,
      extractedTaskTitles,
    };
  };

  // 3. Request AI Draft for manual review
  const handleRequestAiDraft = async (chatId: string): Promise<string | null> => {
    setIsGeneratingAiDraft(true);
    const chat = chats.find((c) => c.id === chatId);
    const chatHistory = messages[chatId] || [];
    const lastMsg = chatHistory[chatHistory.length - 1];

    try {
      const response = await fetch('/api/assistant/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingMessage: lastMsg?.content || 'Hola, ¿cómo estás?',
          senderName: chat?.name || 'Contacto',
          chatHistory,
          userContext: settings.userContext,
          assistantTone: settings.assistantTone,
          ownerName: settings.ownerName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.reply;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  // 4. Trigger Simulation from Simulator Tab
  const handleTriggerSimulation = async (chatId: string, message: string) => {
    setIsSimulating(true);
    const chat = chats.find((c) => c.id === chatId);
    const senderName = chat?.name || 'Contacto';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const result = await handleProcessIncomingMessage(chatId, message);

      setSimulationLog((prev) => [
        {
          id: `sim-${Date.now()}`,
          time,
          senderName,
          incoming: message,
          reply: result.reply,
          extractedTasks: result.extractedTaskTitles,
        },
        ...prev,
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  // 5. Generate Morning Daily Briefing
  const handleGenerateBriefing = async (): Promise<string | null> => {
    setIsGeneratingBriefing(true);
    try {
      const response = await fetch('/api/assistant/daily-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.filter((t) => t.status !== 'completed'),
          unreadChats: chats.filter((c) => c.unreadCount > 0),
          ownerName: settings.ownerName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBriefingText(data.briefing);
        return data.briefing;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  // 6. Send Briefing to Self on WhatsApp
  const handleSendBriefingToWhatsAppSelf = (text: string) => {
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const briefingMsg: WhatsAppMessage = {
      id: `msg-brief-${Date.now()}`,
      chatId: selectedChatId,
      sender: 'ai_assistant',
      content: `📋 RESUMEN MATUTINO DE TAREAS Y DEBERES:\n\n${text}`,
      timestamp: timeFormatted,
      status: 'delivered',
      isAutonomousReply: true,
      detectedIntent: 'resumen_ejecutivo_diario',
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), briefingMsg],
    }));

    showToast('Resumen diario enviado a tu chat de WhatsApp');
    if (settings.enableAudioAlerts) {
      playSentMessageSound();
    }
  };

  // 7. Add New Chat
  const handleAddNewChat = (name: string, phone: string, initialMsg?: string) => {
    const newChatId = `chat-${Date.now()}`;
    const firstMsg: WhatsAppMessage = {
      id: `msg-init-${Date.now()}`,
      chatId: newChatId,
      sender: initialMsg ? 'contact' : 'user',
      content: initialMsg || 'Hola, ¿en qué podemos ayudarte?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    const newChat: WhatsAppChat = {
      id: newChatId,
      name,
      phoneNumber: phone,
      lastMessage: firstMsg,
      unreadCount: initialMsg ? 1 : 0,
      isPinned: false,
      autoPilotEnabled: true,
      tags: ['Nuevo'],
      roleDescription: 'Contacto de WhatsApp',
    };

    setChats((prev) => [newChat, ...prev]);
    setMessages((prev) => ({ ...prev, [newChatId]: [firstMsg] }));
    setSelectedChatId(newChatId);
    setMobileChatOpen(true);

    if (initialMsg) {
      handleProcessIncomingMessage(newChatId, initialMsg);
    }
  };

  // Android Navigation Actions (Back, Home, Recents)
  const handleAndroidBack = () => {
    if (activeTab === 'chats' && mobileChatOpen) {
      setMobileChatOpen(false);
      return;
    }
    if (activeTab !== 'chats') {
      setActiveTab('chats');
      return;
    }
  };

  const handleAndroidHome = () => {
    setMobileChatOpen(false);
    setActiveTab('chats');
  };

  const handleAndroidRecents = () => {
    // Quick toggle between chats and tasks
    setActiveTab((prev) => (prev === 'chats' ? 'tasks' : 'chats'));
  };

  return (
    <div className="min-h-screen w-full bg-[#070d11] text-slate-100 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Viewport Control Bar (Toggle Phone Mockup vs Full-Width Mobile View) */}
      <div className="w-full bg-[#111b21] border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300 z-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-100">WhatsApp Android OS v14</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            · Material You + Auto-Pilot
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Install on Android PWA Button */}
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#00a884] hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors cursor-pointer text-xs"
              title="Instalar como app nativa WebAPK en Android"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar en Android</span>
            </button>
          )}

          {/* Toggle Device Mockup Mode */}
          <button
            onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#202c33] hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer text-xs border border-slate-700/60"
            title={isPhoneFrameMode ? 'Ver en pantalla completa' : 'Ver en marco de smartphone Android'}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {isPhoneFrameMode ? 'Pantalla Completa' : 'Marco de Celular'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Container: Full Mobile or Centered Phone Frame */}
      <div
        className={`w-full transition-all duration-300 flex-1 flex flex-col justify-center items-center ${
          isPhoneFrameMode
            ? 'p-2 sm:p-6 max-w-md my-auto'
            : 'h-full max-w-full'
        }`}
      >
        <div
          className={`w-full bg-[#0b141a] flex flex-col overflow-hidden relative ${
            isPhoneFrameMode
              ? 'rounded-[42px] border-[10px] border-[#182229] shadow-2xl h-[840px] max-h-[92vh]'
              : 'h-[calc(100vh-41px)]'
          }`}
        >
          {/* 1. Android Native Status Bar */}
          <AndroidStatusBar
            batteryLevel={device.batteryLevel}
            hasUnread={unreadCount > 0}
          />

          {/* 2. WhatsApp Android Top Bar */}
          <AndroidTopBar
            onOpenSearch={() => setActiveTab('chats')}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setMobileChatOpen(false);
            }}
            autoPilotGlobal={chatbotConfig.enabled}
            onToggleAutoPilot={() => {
              const newEnabled = !chatbotConfig.enabled;
              setChatbotConfig((prev) => ({
                ...prev,
                enabled: newEnabled,
              }));
              setSettings((prev) => ({
                ...prev,
                autoPilotGlobal: newEnabled,
              }));
              showToast(
                newEnabled ? 'Chatbot de WhatsApp activado' : 'Chatbot de WhatsApp en pausa',
                newEnabled
                  ? 'El chatbot responderá automáticamente a tus mensajes de WhatsApp con IA.'
                  : 'Las respuestas automáticas del chatbot están pausadas temporalmente.'
              );
            }}
            onOpenBriefing={() => {
              setShowBriefingModal(true);
              handleGenerateBriefing();
            }}
            isDeviceConnected={device.status === 'connected'}
            onOpenVoiceDictation={() => setShowGlobalVoiceModal(true)}
          />

          {/* 3. Main Workspace Area */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {activeTab === 'chats' && (
              <div className="flex-1 flex overflow-hidden relative">
                {/* Chat list is visible on wide screens or when mobileChatOpen is false */}
                <div
                  className={`w-full md:w-80 lg:w-96 flex flex-col h-full ${
                    mobileChatOpen ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <ChatList
                    chats={chats}
                    selectedChatId={selectedChatId}
                    onSelectChat={(id) => {
                      setSelectedChatId(id);
                      setMobileChatOpen(true);
                      // Clear unread
                      setChats((prev) =>
                        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
                      );
                    }}
                    onAddNewChat={handleAddNewChat}
                  />
                </div>

                {/* Chat window is visible on wide screens or when mobileChatOpen is true */}
                <div
                  className={`flex-1 h-full ${
                    mobileChatOpen ? 'flex' : 'hidden md:flex'
                  }`}
                >
                  {currentChat ? (
                    <ChatWindow
                      chat={currentChat}
                      messages={currentChatMessages}
                      onSendMessage={handleSendMessage}
                      onToggleChatAutoPilot={(chatId) => {
                        setChats((prev) =>
                          prev.map((c) =>
                            c.id === chatId
                              ? { ...c, autoPilotEnabled: !c.autoPilotEnabled }
                              : c
                          )
                        );
                      }}
                      onRequestAiDraft={handleRequestAiDraft}
                      onSimulateIncomingFromCurrent={(chatId, text) => {
                        if (text) handleProcessIncomingMessage(chatId, text);
                      }}
                      isGeneratingAiDraft={isGeneratingAiDraft}
                      onBackMobile={() => setMobileChatOpen(false)}
                      onAddVoiceTask={(newTask) => {
                        const task: TaskItem = {
                          ...newTask,
                          id: `task-${Date.now()}`,
                          createdAt: 'Hoy',
                        };
                        setTasks((prev) => [task, ...prev]);
                        showToast('Deber dictado por voz añadido', task.title);
                        if (settings.enableAudioAlerts) {
                          playTaskCreatedSound();
                        }
                      }}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                      Selecciona una conversación
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'chatbot' && (
              <ChatbotHub
                config={chatbotConfig}
                onSaveConfig={(newConfig) => {
                  setChatbotConfig(newConfig);
                  setSettings((prev) => ({
                    ...prev,
                    autoPilotGlobal: newConfig.enabled,
                  }));
                }}
                chats={chats}
                onToggleChatAutoPilot={(chatId) => {
                  setChats((prev) =>
                    prev.map((c) =>
                      c.id === chatId
                        ? { ...c, autoPilotEnabled: !c.autoPilotEnabled }
                        : c
                    )
                  );
                }}
                onNavigateToChat={(chatId) => {
                  setSelectedChatId(chatId);
                  setMobileChatOpen(true);
                  setActiveTab('chats');
                }}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskManager
                tasks={tasks}
                onToggleTaskStatus={(taskId) => {
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === taskId
                        ? {
                            ...t,
                            status: t.status === 'completed' ? 'pending' : 'completed',
                            completedAt: t.status !== 'completed' ? new Date().toISOString() : undefined,
                          }
                        : t
                    )
                  );
                }}
                onAddTask={(newTask) => {
                  const task: TaskItem = {
                    ...newTask,
                    id: `task-${Date.now()}`,
                    createdAt: 'Hoy',
                  };
                  setTasks((prev) => [task, ...prev]);
                  showToast('Deber añadido a la agenda de Android', task.title);
                }}
                onDeleteTask={(taskId) => {
                  setTasks((prev) => prev.filter((t) => t.id !== taskId));
                }}
                onNavigateToChat={(chatId) => {
                  setSelectedChatId(chatId);
                  setMobileChatOpen(true);
                  setActiveTab('chats');
                }}
                onGenerateBriefing={handleGenerateBriefing}
                isGeneratingBriefing={isGeneratingBriefing}
                briefingText={briefingText}
                onSendBriefingToWhatsAppSelf={handleSendBriefingToWhatsAppSelf}
              />
            )}

            {activeTab === 'simulator' && (
              <SimulatorHub
                chats={chats}
                onTriggerSimulation={handleTriggerSimulation}
                isSimulating={isSimulating}
                simulationLog={simulationLog}
              />
            )}

            {activeTab === 'device' && (
              <DevicePairingModal
                device={device}
                onUpdateDevice={(updated) => setDevice((prev) => ({ ...prev, ...updated }))}
                onClose={() => setActiveTab('chats')}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel
                settings={settings}
                onSaveSettings={(newSettings) => setSettings(newSettings)}
              />
            )}

            {/* Android WhatsApp Floating Action Button (FAB) */}
            {activeTab === 'chats' && !mobileChatOpen && (
              <button
                onClick={() => setActiveTab('chatbot')}
                className="absolute bottom-4 right-4 w-14 h-14 rounded-2xl bg-[#00a884] hover:bg-emerald-600 active:scale-90 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer z-40"
                title="Abrir Chatbot de WhatsApp y probador en vivo"
              >
                <Sparkles className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* 4. WhatsApp Android Bottom Navigation Bar */}
          {(!mobileChatOpen || activeTab !== 'chats') && (
            <AndroidBottomNav
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileChatOpen(false);
              }}
              unreadCount={unreadCount}
              pendingTasksCount={pendingTasksCount}
              chatbotEnabled={chatbotConfig.enabled}
            />
          )}

          {/* 5. Android System 3-Button Navigation Bar */}
          <AndroidNavigationBar
            onBack={handleAndroidBack}
            onHome={handleAndroidHome}
            onRecents={handleAndroidRecents}
          />
        </div>
      </div>

      {/* Android Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 bg-[#1f2c34] border border-emerald-500/80 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-sm w-[90%] animate-fade-in text-xs">
          <div className="w-7 h-7 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-100 truncate">{toastNotification.title}</p>
            {toastNotification.subtitle && (
              <p className="text-[11px] text-slate-300 truncate">{toastNotification.subtitle}</p>
            )}
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Briefing Modal */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Resumen Matutino Android</h3>
              </div>
              <button
                onClick={() => setShowBriefingModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-[#202c33] border border-slate-700 rounded-xl p-4 text-xs text-slate-200 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap font-sans">
              {isGeneratingBriefing ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span>Generando resumen ejecutivo con Gemini 3.8 Flash...</span>
                </div>
              ) : (
                briefingText || 'No se pudo generar el resumen.'
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleGenerateBriefing}
                disabled={isGeneratingBriefing}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Regenerar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (briefingText) {
                    handleSendBriefingToWhatsAppSelf(briefingText);
                    setShowBriefingModal(false);
                  }
                }}
                disabled={!briefingText || isGeneratingBriefing}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#00a884] text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                <span>Enviar a mi WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Voice Dictation Modal (Top Bar Shortcut) */}
      {showGlobalVoiceModal && (
        <VoiceDictationModal
          mode="task"
          onClose={() => setShowGlobalVoiceModal(false)}
          onTranscribeTask={(newTask) => {
            const task: TaskItem = {
              ...newTask,
              id: `task-${Date.now()}`,
              createdAt: 'Hoy',
            };
            setTasks((prev) => [task, ...prev]);
            showToast('Deber dictado por voz añadido a tu agenda', task.title);
            if (settings.enableAudioAlerts) {
              playTaskCreatedSound();
            }
            setShowGlobalVoiceModal(false);
          }}
          onTranscribeMessage={(msgText) => {
            if (currentChat) {
              handleSendMessage(currentChat.id, msgText);
              showToast(`Mensaje dictado enviado a ${currentChat.name}`);
            }
            setShowGlobalVoiceModal(false);
          }}
        />
      )}
    </div>
  );
}
