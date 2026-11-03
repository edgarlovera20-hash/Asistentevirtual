import React, { useState } from 'react';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Battery, 
  Wifi, 
  Unlink, 
  Copy, 
  Check,
  KeyRound
} from 'lucide-react';
import { DeviceConnection } from '../types';

interface DevicePairingModalProps {
  device: DeviceConnection;
  onUpdateDevice: (updated: Partial<DeviceConnection>) => void;
  onClose?: () => void;
}

export const DevicePairingModal: React.FC<DevicePairingModalProps> = ({
  device,
  onUpdateDevice,
  onClose,
}) => {
  const [pairingMode, setPairingMode] = useState<'qr' | 'code'>('qr');
  const [inputPhone, setInputPhone] = useState(device.phoneNumber || '+54 9 11 ');
  const [generatedCode, setGeneratedCode] = useState(device.devicePairingCode || 'WH-8924-LX');
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);

  const handleRefreshQr = () => {
    setIsRefreshingQr(true);
    setTimeout(() => {
      setIsRefreshingQr(false);
    }, 700);
  };

  const handleGeneratePhoneCode = (e: React.FormEvent) => {
    e.preventDefault();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codePart1 = '';
    let codePart2 = '';
    for (let i = 0; i < 4; i++) {
      codePart1 += chars.charAt(Math.floor(Math.random() * chars.length));
      codePart2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `${codePart1}-${codePart2}`;
    setGeneratedCode(newCode);
    onUpdateDevice({
      phoneNumber: inputPhone,
      devicePairingCode: newCode,
      status: 'pairing_code',
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleConnect = () => {
    if (device.status === 'connected') {
      onUpdateDevice({ status: 'disconnected' });
    } else {
      onUpdateDevice({
        status: 'connected',
        lastSyncTime: 'Hace unos instantes',
        batteryLevel: Math.floor(75 + Math.random() * 24),
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b141a] p-4 md:p-8 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Vincular WhatsApp (Multi-Dispositivo)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Compatible con <strong>WhatsApp normal (personal)</strong> y <strong>WhatsApp Business</strong>. Vinculación directa por Código QR o Código de 8 dígitos de tu teléfono. <strong>Sin Meta API, sin tokens ni costos por mensaje.</strong>
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
          >
            Volver a Chats
          </button>
        )}
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-[#111b21] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                device.status === 'connected'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                  : 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
              }`}
            >
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">
                  {device.status === 'connected'
                    ? 'Dispositivo Vinculado Activo'
                    : 'Esperando Vinculación de WhatsApp'}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    device.status === 'connected'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                  }`}
                >
                  {device.status === 'connected' ? 'CONECTADO' : 'PENDIENTE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {device.phoneNumber || 'Sin teléfono asociado'} · {device.pairedDeviceName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleConnect}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                device.status === 'connected'
                  ? 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60'
                  : 'bg-[#00a884] hover:bg-emerald-600 text-white'
              }`}
            >
              {device.status === 'connected' ? 'Desconectar Dispositivo' : 'Confirmar Conexión'}
            </button>
          </div>
        </div>

        {/* Telemetry info when connected */}
        {device.status === 'connected' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300 bg-[#202c33] p-2.5 rounded-lg">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>Batería del Teléfono:</span>
              <span className="font-mono font-bold text-slate-100 ml-auto">
                {device.batteryLevel}%
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 bg-[#202c33] p-2.5 rounded-lg">
              <Wifi className="w-4 h-4 text-sky-400" />
              <span>Sincronización de Chats:</span>
              <span className="font-mono text-emerald-400 ml-auto">En tiempo real</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 bg-[#202c33] p-2.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protocolo Criptográfico:</span>
              <span className="font-mono text-slate-300 ml-auto">Noise / Signal E2EE</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Pairing via QR or via 8-Digit Pairing Code */}
      <div className="bg-[#111b21] border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setPairingMode('qr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              pairingMode === 'qr'
                ? 'bg-[#00a884] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-[#202c33]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Opción 1: Escanear Código QR</span>
          </button>

          <button
            onClick={() => setPairingMode('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              pairingMode === 'code'
                ? 'bg-[#00a884] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-[#202c33]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Opción 2: Vincular con Código de Teléfono</span>
          </button>
        </div>

        {pairingMode === 'qr' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Step-by-step guide */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="font-bold text-sm text-slate-100">
                Instrucciones para vincular WhatsApp Web:
              </h3>
              <ol className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold font-mono text-slate-200 shrink-0">
                    1
                  </span>
                  <span>Abre WhatsApp en tu teléfono móvil.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold font-mono text-slate-200 shrink-0">
                    2
                  </span>
                  <span>
                    Toca en <strong>Menú (⋮)</strong> en Android o <strong>Ajustes (⚙)</strong> en iPhone.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold font-mono text-slate-200 shrink-0">
                    3
                  </span>
                  <span>Selecciona <strong>Dispositivos vinculados</strong> y luego <strong>Vincular un dispositivo</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold font-mono text-slate-200 shrink-0">
                    4
                  </span>
                  <span>Apunta la cámara de tu teléfono a este código QR para sincronizar de inmediato.</span>
                </li>
              </ol>

              <div className="p-3 bg-[#202c33] rounded-lg border border-slate-700/60 text-[11px] text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  No necesitas mantener el teléfono encendido todo el tiempo gracias al soporte multi-dispositivo nativo de WhatsApp.
                </span>
              </div>
            </div>

            {/* Simulated Dynamic QR Graphic */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
              <div className="relative p-5 bg-white rounded-2xl shadow-xl flex flex-col items-center">
                {/* SVG QR Code Simulation with Center WhatsApp Icon */}
                <div className="w-56 h-56 relative flex items-center justify-center">
                  <svg
                    viewBox="0 0 200 200"
                    className={`w-full h-full transition-opacity duration-300 ${
                      isRefreshingQr ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    {/* Corner Position Markers */}
                    <rect x="10" y="10" width="50" height="50" fill="#0b141a" rx="6" />
                    <rect x="18" y="18" width="34" height="34" fill="#ffffff" rx="4" />
                    <rect x="24" y="24" width="22" height="22" fill="#0b141a" rx="2" />

                    <rect x="140" y="10" width="50" height="50" fill="#0b141a" rx="6" />
                    <rect x="148" y="18" width="34" height="34" fill="#ffffff" rx="4" />
                    <rect x="154" y="24" width="22" height="22" fill="#0b141a" rx="2" />

                    <rect x="10" y="140" width="50" height="50" fill="#0b141a" rx="6" />
                    <rect x="18" y="148" width="34" height="34" fill="#ffffff" rx="4" />
                    <rect x="24" y="154" width="22" height="22" fill="#0b141a" rx="2" />

                    {/* QR Data Pattern Grid */}
                    <g fill="#0b141a">
                      <rect x="70" y="15" width="10" height="10" />
                      <rect x="90" y="15" width="15" height="10" />
                      <rect x="115" y="15" width="12" height="10" />

                      <rect x="70" y="35" width="20" height="10" />
                      <rect x="100" y="35" width="10" height="10" />
                      <rect x="120" y="35" width="10" height="15" />

                      <rect x="15" y="70" width="15" height="10" />
                      <rect x="40" y="70" width="20" height="12" />
                      <rect x="70" y="70" width="10" height="20" />
                      <rect x="110" y="70" width="20" height="10" />
                      <rect x="140" y="70" width="15" height="15" />
                      <rect x="165" y="70" width="20" height="10" />

                      <rect x="15" y="90" width="20" height="10" />
                      <rect x="45" y="90" width="15" height="20" />
                      <rect x="140" y="95" width="25" height="10" />
                      <rect x="175" y="95" width="15" height="15" />

                      <rect x="15" y="120" width="10" height="10" />
                      <rect x="35" y="118" width="25" height="10" />
                      <rect x="70" y="110" width="18" height="15" />
                      <rect x="110" y="115" width="15" height="10" />
                      <rect x="150" y="120" width="18" height="10" />

                      <rect x="70" y="145" width="15" height="10" />
                      <rect x="95" y="140" width="12" height="20" />
                      <rect x="120" y="145" width="20" height="15" />
                      <rect x="150" y="145" width="12" height="25" />
                      <rect x="170" y="150" width="15" height="12" />

                      <rect x="70" y="170" width="22" height="15" />
                      <rect x="105" y="175" width="15" height="10" />
                      <rect x="130" y="170" width="15" height="15" />
                      <rect x="160" y="175" width="25" height="10" />
                    </g>

                    {/* Central Brand Emblem */}
                    <circle cx="100" cy="100" r="18" fill="#ffffff" />
                    <circle cx="100" cy="100" r="14" fill="#00a884" />
                    <path
                      d="M94 100 C94 96 97 93 101 93 C105 93 108 96 108 100 C108 104 105 107 101 107 L97 108 L98 104 C95 103 94 101 94 100 Z"
                      fill="#ffffff"
                    />
                  </svg>

                  {/* Refresh overlay indicator */}
                  {isRefreshingQr && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between w-full text-slate-600 text-xs font-mono">
                  <span>Actualización cada 20s</span>
                  <button
                    onClick={handleRefreshQr}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Recargar QR</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Phone Number Pairing Code */
          <div className="max-w-lg mx-auto space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                Vincular con Código de 8 Dígitos en tu Teléfono
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Si tu cámara no puede escanear el QR, ingresa tu número para recibir un código de vinculación directamente en tu app de WhatsApp.
              </p>
            </div>

            <form onSubmit={handleGeneratePhoneCode} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Número de WhatsApp (con código de país):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    className="flex-1 bg-[#202c33] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00a884] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                  >
                    Generar Código
                  </button>
                </div>
              </div>
            </form>

            {/* Generated Code Display */}
            <div className="p-5 bg-[#202c33] border border-slate-700 rounded-xl text-center space-y-3">
              <span className="text-xs text-slate-400 font-medium">
                Código para introducir en tu teléfono:
              </span>

              <div className="flex items-center justify-center gap-2">
                <div className="px-6 py-3 bg-[#111b21] border border-emerald-500/50 rounded-xl font-mono text-2xl font-bold tracking-widest text-emerald-300 shadow-inner">
                  {generatedCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-3 bg-[#111b21] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                  title="Copiar código"
                >
                  {isCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>1. Abre la notificación "Introduce el código para vincular nuevo dispositivo" en tu teléfono.</p>
                <p>2. Escribe los 8 caracteres mostrados arriba.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
