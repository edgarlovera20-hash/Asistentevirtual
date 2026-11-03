import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  playRecordingStartSound, 
  playRecordingStopSound, 
  playTranscriptionSuccessSound 
} from './audio';

export interface UseVoiceRecorderOptions {
  onTranscriptionComplete?: (text: string, structuredTask?: any) => void;
  onError?: (errorMessage: string) => void;
}

export function useVoiceRecorder(options?: UseVoiceRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [livePreview, setLivePreview] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Clean up all streams and contexts
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Audio level visualizer loop
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize roughly between 0 and 100
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.debug('Visualizer audio context init bypassed', e);
    }
  };

  // Optional live speech recognition for real-time dictation preview
  const startLiveSpeechRecognition = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interim += event.results[i][0].transcript;
        }
        if (interim) {
          setLivePreview(interim);
        }
      };

      recognition.onerror = () => {
        // Softly ignore Web Speech API errors; Gemini will do the definitive transcription
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (e) {
      console.debug('SpeechRecognition not available or error', e);
    }
  };

  const startRecording = async (): Promise<boolean> => {
    setErrorMessage(null);
    setLivePreview('');
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = 'Tu navegador no soporta grabación de audio con MediaRecorder.';
      setErrorMessage(err);
      options?.onError?.(err);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Select supported MIME type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250); // collect in small slices
      setIsRecording(true);
      setDuration(0);

      playRecordingStartSound();

      // Start elapsed timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Start visualizer and optional live speech recognition
      startVisualizer(stream);
      startLiveSpeechRecognition();

      return true;
    } catch (err: any) {
      console.error('Error starting MediaRecorder:', err);
      let errorMsg = 'No se pudo acceder al micrófono. Por favor permite el acceso para dictar.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Permiso de micrófono denegado en el navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No se encontró ningún micrófono conectado en tu dispositivo.';
      }
      setErrorMessage(errorMsg);
      options?.onError?.(errorMsg);
      cleanup();
      return false;
    }
  };

  const cancelRecording = () => {
    playRecordingStopSound();
    cleanup();
    setLivePreview('');
    setErrorMessage(null);
  };

  const stopRecording = (mode: 'chat' | 'task' = 'chat'): Promise<{ transcription: string; taskData?: any } | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        cleanup();
        resolve(null);
        return;
      }

      playRecordingStopSound();

      recorder.onstop = async () => {
        setIsTranscribing(true);

        try {
          const mimeType = recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          // If recording is empty or very short (< 0.2s)
          if (audioBlob.size < 500) {
            if (livePreview.trim()) {
              // Use speech preview if audio chunk was too small
              const fallbackResult = { transcription: livePreview.trim() };
              playTranscriptionSuccessSound();
              options?.onTranscriptionComplete?.(fallbackResult.transcription);
              resolve(fallbackResult);
              return;
            }
            throw new Error('La grabación fue demasiado breve. Intenta mantener presionado o hablar más claro.');
          }

          // Convert Blob to Base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);

          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result as string;

              const response = await fetch('/api/assistant/transcribe-voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType,
                  mode,
                }),
              });

              if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al transcribir el audio en el servidor.');
              }

              const data = await response.json();
              const text = data.transcription || livePreview || '';

              if (!text.trim()) {
                throw new Error('No se detectaron palabras en la grabación.');
              }

              playTranscriptionSuccessSound();
              options?.onTranscriptionComplete?.(text, data.structuredTask);
              resolve({
                transcription: text,
                taskData: data.structuredTask,
              });
            } catch (postErr: any) {
              console.error('Transcription API error:', postErr);
              // Fallback to livePreview if available
              if (livePreview.trim()) {
                const fallbackRes = { transcription: livePreview.trim() };
                playTranscriptionSuccessSound();
                options?.onTranscriptionComplete?.(fallbackRes.transcription);
                resolve(fallbackRes);
              } else {
                const msg = postErr.message || 'Error en la transcripción de voz.';
                setErrorMessage(msg);
                options?.onError?.(msg);
                resolve(null);
              }
            } finally {
              setIsTranscribing(false);
              cleanup();
            }
          };

          reader.onerror = () => {
            setIsTranscribing(false);
            cleanup();
            resolve(null);
          };
        } catch (e: any) {
          console.error('Stop recording error:', e);
          setIsTranscribing(false);
          cleanup();
          const msg = e.message || 'Error al procesar el audio.';
          setErrorMessage(msg);
          options?.onError?.(msg);
          resolve(null);
        }
      };

      try {
        recorder.stop();
      } catch (err) {
        console.error('Recorder stop failure', err);
        cleanup();
        resolve(null);
      }
    });
  };

  // Helper to format seconds as mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    isTranscribing,
    duration,
    durationFormatted: formatDuration(duration),
    audioLevel,
    livePreview,
    errorMessage,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError: () => setErrorMessage(null),
  };
}
