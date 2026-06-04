import { useState, useRef, useCallback } from 'react';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';

interface UseDeepgramReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  error: string | null;
}

export function useDeepgram(onSilenceFinalize: (finalTranscript: string) => void): UseDeepgramReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const deepgramClientRef = useRef<LiveClient | null>(null);
  const microphoneRef = useRef<MediaRecorder | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTranscriptRef = useRef('');

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    if (microphoneRef.current && microphoneRef.current.state === 'recording') {
      microphoneRef.current.stop();
      microphoneRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    if (deepgramClientRef.current) {
      deepgramClientRef.current.disconnect();
      deepgramClientRef.current = null;
    }

    setIsListening(false);

    if (currentTranscriptRef.current.trim()) {
      onSilenceFinalize(currentTranscriptRef.current.trim());
      currentTranscriptRef.current = '';
    }
  }, [onSilenceFinalize]);

  const handleSilenceDetection = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = setTimeout(() => {
      if (currentTranscriptRef.current.trim()) {
        stopListening();
      }
    }, 1500); // 1.5 seconds of silence
  }, [stopListening]);

  const startListening = async () => {
    try {
      setError(null);
      setTranscript('');
      currentTranscriptRef.current = '';

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support audio recording');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      microphoneRef.current = mediaRecorder;

      const tokenResponse = await fetch('/api/deepgram/token');
      const { key } = await tokenResponse.json();

      if (!key) {
        throw new Error('Failed to get STT token');
      }

      const deepgram = createClient(key);
      const liveClient = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
      });

      deepgramClientRef.current = liveClient;

      liveClient.on(LiveTranscriptionEvents.Open, () => {
        setIsListening(true);
        mediaRecorder.start(250); // Send audio chunks every 250ms

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && liveClient.getReadyState() === 1) { // 1 = OPEN
            liveClient.send(event.data);
          }
        };
      });

      liveClient.on(LiveTranscriptionEvents.Transcript, (data) => {
        const result = data.channel.alternatives[0].transcript;
        if (result) {
          const isFinal = data.is_final;

          if (isFinal) {
            currentTranscriptRef.current += ` ${result}`;
          } else {
             // For interim, we might just show it briefly but usually we rely on current + interim
             setTranscript(currentTranscriptRef.current + ` ${result}`);
          }

          if (isFinal) {
            setTranscript(currentTranscriptRef.current);
          }

          handleSilenceDetection();
        }
      });

      liveClient.on(LiveTranscriptionEvents.Error, (err) => {
        console.error('Deepgram STT Error:', err);
        setError('Transcription error occurred');
        stopListening();
      });

      liveClient.on(LiveTranscriptionEvents.Close, () => {
        setIsListening(false);
      });

    } catch (err: any) {
      console.error('Error starting STT:', err);
      setError(err.message || 'Failed to start microphone');
      setIsListening(false);
    }
  };

  return { isListening, transcript, startListening, stopListening, error };
}
