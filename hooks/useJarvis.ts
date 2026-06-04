import { useState, useCallback, useRef } from 'react';
import { useDeepgram } from './useDeepgram';
import { OrbState } from '@/components/OrbAnimation';

interface JarvisIntent {
  intent: 'open_url' | 'search_web' | 'send_message' | 'chat' | 'unknown';
  target?: string;
  content?: string;
  response: string;
}

export function useJarvis() {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [jarvisResponse, setJarvisResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setUserTranscript(text);
    setOrbState('thinking');
    setJarvisResponse('');

    try {
      // 1. Send to Claude for Intent Parsing
      const thinkRes = await fetch('/api/jarvis/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });

      if (!thinkRes.ok) throw new Error('Failed to process intent');

      const intentData: JarvisIntent = await thinkRes.json();
      setJarvisResponse(intentData.response);

      // 2. Execute Intent
      switch (intentData.intent) {
        case 'open_url':
        case 'search_web':
          if (intentData.target) {
            let url = intentData.target;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              url = `https://${url}`;
            }
            window.open(url, '_blank');
          }
          break;
        case 'chat':
        case 'unknown':
        default:
          break;
      }

      // 3. Generate and Play Audio
      if (intentData.response) {
        const speakRes = await fetch('/api/jarvis/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: intentData.response }),
        });

        if (!speakRes.ok) throw new Error('Failed to generate audio');

        const audioBlob = await speakRes.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => setOrbState('speaking');
        audio.onended = () => {
          setOrbState('idle');
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setOrbState('idle');
          setError('Failed to play audio');
        };

        await audio.play();
      } else {
        setOrbState('idle');
      }
    } catch (err: any) {
      console.error('Jarvis error:', err);
      setError(err.message || 'An error occurred');
      setOrbState('idle');
    }
  }, []);

  const { isListening, transcript, startListening, stopListening, error: sttError } = useDeepgram(processTranscript);

  // Sync Deepgram listening state with Orb state
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      // Orb state will transition to 'thinking' in processTranscript if there's text
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setUserTranscript('');
      setJarvisResponse('');
      setError(null);
      setOrbState('listening');
      startListening();
    }
  };

  // Update transcript in real-time
  const displayTranscript = isListening ? transcript : userTranscript;

  return {
    orbState: isListening ? 'listening' : orbState,
    transcript: displayTranscript,
    jarvisResponse,
    error: error || sttError,
    toggleListening: handleToggleListening,
    isListening
  };
}
