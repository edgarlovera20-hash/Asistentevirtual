# WhatsApp AI Manager & Task Assistant

Una plataforma integral que administra WhatsApp mediante vinculación por código QR o código de dispositivo, responde mensajes de forma autónoma con inteligencia artificial profesional y detecta automáticamente tareas y deberes en las conversaciones con un sistema activo de agenda y recordatorios.

### User Review & Critical Decisions

> [!IMPORTANT]
> Se han incorporado las elecciones confirmadas en la fase de clarificación para garantizar que la app cumpla exactamente con tu flujo de trabajo:

- **Método de Conexión de WhatsApp**: Vinculación mediante escaneo de Código QR interactivo o generación de código alfanumérico de 8 dígitos para dispositivo vinculado (similar a WhatsApp Web / Linked Devices), con monitor de estado en vivo, reconexión rápida y panel de simulación de mensajes entrantes.
- **Personalidad y Estilo del Asistente**: Tono profesional, cordial y enfocado en productividad: resuelve dudas de remitentes, gestiona solicitudes y agenda compromisos de manera educada y precisa.
- **Detección y Recordatorios de Tareas**: Motor impulsado por Gemini 3.8 Flash que analiza en tiempo real los mensajes recibidos, identifica compromisos, fechas límite, prioridades y deberes, integrándolos en una agenda de tareas interactiva con alarmas y notificaciones.
- **Autonomía del Bot**: Interruptor de Autonomía Total (Auto-pilot ON/OFF), reglas de filtrado por remitente (responder a todos, solo a desconocidos, o contactos VIP) y plantilla editable de contexto comercial/personal.

---

### 1. Overview & Core Concept

- **Qué hace la aplicación**:
  1. **Vinculación y Conexión WhatsApp**: Interfaz de enlace con código QR dinámico y emparejamiento con código de dispositivo de 8 caracteres.
  2. **Centro de Mensajes y Chats**: Bandeja de entrada estilo WhatsApp Web con hilos de conversación, historial de mensajes, etiquetas de estado y vista de conversación en tiempo real.
  3. **Motor Autónomo de Respuestas (Auto-Responder)**: Responde de forma independiente o supervisada a los mensajes entrantes utilizando Gemini 3.8 Flash con un prompt de sistema profesional y memoria del hilo.
  4. **Extractor Inteligente de Tareas & Agenda**: Detecta compromisos ("te envío el reporte mañana a las 3pm", "reunión el viernes", "pagar factura") y los añade automáticamente a la lista de deberes con fecha, hora, prioridad y recordatorios.
  5. **Simulador y Laboratorio de Pruebas**: Permite simular mensajes entrantes de clientes, amigos o jefes para observar al instante cómo responde el bot y cómo extrae las tareas.
- **Público Objetivo**: Profesionales, autónomos, estudiantes y negocios que necesitan delegar la atención de WhatsApp sin descuidar sus obligaciones ni olvidar tareas importantes.
- **Valor Principal**: Automatización del 100% de las respuestas rutinarias con calidad profesional y cero tareas olvidadas gracias a la extracción automática y el calendario de deberes.

---

### 2. User Experience & Visual Design

- **Flujos de Usuario Principales**:
  1. *Vinculación*: El usuario abre la app y observa el asistente listo; puede escanear el QR o solicitar un código de 8 dígitos para conectar su cuenta.
  2. *Gestión de Mensajes & Auto-Piloto*: Puede activar o pausar el auto-respondedor en cualquier momento con un botón de control en la barra superior. Puede revisar los chats y ver las respuestas enviadas por la IA con un distintivo visual sutil.
  3. *Agenda y Recordatorios*: Pestaña dedicada con filtro por estado (Pendientes, Para Hoy, Vencidas, Completadas). Las tareas extraídas por IA muestran el mensaje de origen del chat.
  4. *Ajustes de IA y Reglas*: Permite definir horario de atención, reglas de excepción (contactos silenciados), mensaje de bienvenida y contexto sobre quién es el usuario (sus servicios, datos bancarios, etc.).
  5. *Simulador en Vivo*: Herramienta interactiva para probar escenarios enviando un WhatsApp simulado y viendo el flujo completo (recepción -> análisis IA -> respuesta enviada -> tarea añadida).

- **Identidad Visual y Tema**:
  - *Estética*: Utilitaria, refinada y moderna inspirada en la paleta oficial de WhatsApp Business y sistemas de alta productividad.
  - *Paleta de Colores*:
    - Verde Esmeralda WhatsApp (`#25D366` / `#128C7E` / `#00A884`) como acento de marca.
    - Superficies: Fondo neutro limpio (`#0B141A` en modo oscuro / `#F0F2F5` en modo claro, soporte dual).
    - Bordes sutiles de 1px (`border-slate-200 dark:border-slate-800`), sin tarjetas anidadas excesivas.
  - *Tipografía*: `Plus Jakarta Sans` para titulares e interfaz, números tabulares (`font-mono tabular-nums`) para timestamps, códigos de emparejamiento y contadores.
  - *Disciplina Anti-Slop*: Cero cápsulas/pills de adorno en metadatos, separadores tipográficos sutiles (`·`), sin textos pseudo-código ni scorecards artificiales.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Conector de Dispositivo Dual (Simulador QR Interactivo + Configuración Webhook/Cloud API)**
  - *Enfoque*: Generador de Código QR realista y código de emparejamiento con socket de simulación activo + soporte para ingresar credenciales webhook de WhatsApp Cloud API oficial si se desea producción.
  - *Razón*: Permite probar de inmediato la experiencia completa en el navegador sin depender de autorizaciones lentas de Meta, pero manteniendo la arquitectura lista para producción.
- **Decisión 2: Procesamiento Server-Side con Gemini 3.8 Flash**
  - *Enfoque*: Endpoints en backend Express/Vite (`/api/whatsapp/auto-reply`, `/api/whatsapp/extract-tasks`, `/api/whatsapp/briefing`) utilizando `@google/genai` con `gemini-3.8-flash` y `responseSchema` JSON estructurado.
  - *Razón*: Seguridad de clave API en servidor, respuestas ultra-rápidas en milisegundos y extracción de entidades (tarea, fecha límite, prioridad) en formato JSON estricto.
- **Decisión 3: Almacenamiento Local Reactivo y Alertas Sonoras Web Audio**
  - *Enfoque*: Persistencia en `localStorage` con sincronización en tiempo real para tareas, chats y configuración; notificaciones de escritorio con Web Audio API para alertas sonoras de recordatorios.
  - *Razón*: Máxima fiabilidad, sin requerir bases de datos externas adicionales para empezar a funcionar de inmediato.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WhatsApp AI Manager UI                          │
├──────────────────┬─────────────────────────────┬───────────────────────┤
│ Navigation Rail  │ Main Workspace Area         │ Control & Task Drawer │
│ • Chats / Inbox  │ • Chat Viewport & Messages  │ • Task Quick-Agenda   │
│ • Task Manager   │ • Autonomous Response Feed  │ • Auto-Pilot Toggles  │
│ • Simulator Hub  │ • QR Device Pairing Modal   │ • Prompt Context Form │
│ • AI Rules       │ • Input & Quick Actions     │ • Audio Alarm Engine  │
└─────────┬────────┴──────────────┬──────────────┴───────────┬───────────┘
          │                       │                          │
          ▼                       ▼                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Frontend State & Engine                          │
│ • WhatsApp Session Store (Status: Connected / QR / Code / Paused)      │
│ • Messages & Conversation Threads Store                                │
│ • Task & Due Dates Store (Priority, Due Date, Origin Message, Status)  │
│ • Sound & Notification Scheduler (Web Audio Chimes + Browser Notifs)   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Server API Proxy (/api/*)                          │
│ • POST /api/whatsapp/auto-reply  --> Gemini 3.8 Flash (Draft/Send)     │
│ • POST /api/whatsapp/extract-tasks --> Gemini 3.8 Flash (JSON Schema)  │
│ • POST /api/whatsapp/simulate-incoming --> Injects msg & triggers AI   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  @google/genai (gemini-3.8-flash)                      │
│ • System Instructions: Profesional, cordial, agendador de tareas       │
│ • Structured Output Schema: { tasks: [{ title, due, priority }] }      │
└────────────────────────────────────────────────────────────────────────┘
```

#### Estructura de Datos Clave
- `WhatsAppMessage`: `id`, `chatId`, `sender` ('user' | 'contact' | 'ai_assistant'), `content`, `timestamp`, `status` ('sent' | 'delivered' | 'read'), `isAutonomousReply` (boolean).
- `WhatsAppChat`: `id`, `name`, `phoneNumber`, `avatar`, `lastMessage`, `unreadCount`, `isPinned`, `autoPilotEnabled`.
- `TaskItem`: `id`, `title`, `description`, `dueDate` (ISO), `priority` ('high' | 'medium' | 'low'), `category` ('work' | 'personal' | 'client' | 'study'), `status` ('pending' | 'in_progress' | 'completed'), `sourceChatId`, `sourceMessageSnippet`.
- `AssistantConfig`: `autoPilotGlobal` (boolean), `businessContext` (string), `tone` ('professional' | 'cordial'), `autoExtractTasks` (boolean), `notifyOnWhatsApp` (boolean).
