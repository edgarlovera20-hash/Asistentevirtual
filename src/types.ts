export type MessageSender = 'user' | 'contact' | 'ai_assistant';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'client' | 'personal' | 'study';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type FlowNodeId = 'nodo_0' | 'nodo_1' | 'nodo_1_1' | 'nodo_1_2' | 'nodo_1_3' | 'nodo_2' | 'nodo_3';

export interface ConversationLeadData {
  clientName?: string;
  contactMotive?: string;
  currentCompany?: string;
  hasCurrentCompany?: boolean;
  selectedPackage?: string;
  ineProvided?: boolean;
  phoneContact?: string;
  phoneReference?: string;
  email?: string;
  installationAddress?: string;
  portabilityNumber?: string;
  contractHolderName?: string;
  contractFollowUpPhone?: string;
  generalInquiry?: string;
  statusNotes?: string;
}

export interface FlowNodeDefinition {
  id: FlowNodeId;
  code: string;
  name: string;
  description: string;
  agentMessage: string;
  offerMessage?: string;
  routingLogic: string;
  routingBranches?: { label: string; targetNode: FlowNodeId; condition: string }[];
  actionRequired?: string;
  isEscalation?: boolean;
}

export interface WhatsAppMessage {
  id: string;
  chatId: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  status: MessageStatus;
  isAutonomousReply?: boolean;
  detectedIntent?: string;
  suggestedAction?: string;
  flowNodeId?: FlowNodeId;
  isNotificationToOwner?: boolean;
}

export interface WhatsAppChat {
  id: string;
  name: string;
  phoneNumber: string;
  avatarUrl?: string;
  lastMessage: WhatsAppMessage;
  unreadCount: number;
  isPinned: boolean;
  autoPilotEnabled: boolean;
  tags: string[];
  roleDescription?: string;
  isTyping?: boolean;
  currentNodeId?: FlowNodeId;
  leadData?: ConversationLeadData;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string or text
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  sourceChatId?: string;
  sourceChatName?: string;
  sourceSnippet?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DeviceConnection {
  status: 'connected' | 'pairing_qr' | 'pairing_code' | 'disconnected';
  pairedDeviceName: string;
  phoneNumber: string;
  batteryLevel: number;
  lastSyncTime: string;
  devicePairingCode: string;
}

export type NavigationTab = 'chats' | 'chatbot' | 'tasks' | 'simulator' | 'device' | 'settings';

export interface ChatbotKnowledgeItem {
  id: string;
  topic: string;
  content: string;
  keywords: string[];
}

export interface ChatbotRule {
  id: string;
  name: string;
  triggerType: 'keyword' | 'intent' | 'all';
  keywords: string[];
  replyTemplate?: string;
  enabled: boolean;
  actionRequired?: string;
}

export interface ChatbotConfig {
  enabled: boolean;
  botName: string;
  businessName: string;
  welcomeMessageEnabled: boolean;
  welcomeMessageText: string;
  fallbackMessage: string;
  outOfHoursMessage?: string;
  assistantTone: 'professional' | 'cordial' | 'concise' | 'commercial';
  systemInstructions: string;
  replyDelaySeconds: number;
  autoExtractTasks: boolean;
  onlyUnknownNumbers: boolean;
  knowledgeBase: ChatbotKnowledgeItem[];
  rules: ChatbotRule[];
  totalRepliesSent: number;
  totalTasksExtracted: number;
}

export interface AssistantSettings {
  autoPilotGlobal: boolean;
  ownerName: string;
  ownerTitle: string;
  userContext: string;
  assistantTone: 'professional' | 'cordial' | 'concise';
  autoExtractTasks: boolean;
  enableAudioAlerts: boolean;
  replyDelaySeconds: number;
  operatingHours: {
    start: string;
    end: string;
    activeOnlyInHours: boolean;
  };
  linkedDeviceConfig: {
    connectionMethod: 'qr_scanner' | 'pairing_code';
    keepSessionAlive: boolean;
    syncIntervalSeconds: number;
    allowGroupAutoReplies: boolean;
    autoReplyUnknownNumbersOnly: boolean;
  };
}
