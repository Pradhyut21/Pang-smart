'use client';

import { Mic, Square } from 'lucide-react';
import { useJarvis } from '@/hooks/useJarvis';
import { OrbAnimation } from '@/components/OrbAnimation';
import { StatusDisplay } from '@/components/StatusDisplay';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';

export default function Home() {
  const {
    orbState,
    transcript,
    jarvisResponse,
    error,
    toggleListening,
    isListening
  } = useJarvis();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] p-8 selection:bg-cyan-500/30 font-sans">

      {/* Decorative background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-cyan-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">

        {/* Main Interface */}
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <OrbAnimation state={orbState} />
          <StatusDisplay state={orbState} />
        </div>

        {/* Text Displays */}
        <TranscriptDisplay
          userTranscript={transcript}
          jarvisResponse={jarvisResponse}
        />

        {/* Error Display */}
        {error && (
          <div className="mt-4 text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="mt-12">
          <button
            onClick={toggleListening}
            className={`
              relative group flex items-center justify-center w-20 h-20 rounded-full
              transition-all duration-300 ease-out
              ${isListening
                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                : 'bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]'
              }
            `}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-110 group-hover:scale-125 transition-transform duration-300" />
            {isListening ? (
              <Square className="w-8 h-8 text-white fill-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

      </div>
    </main>
  );
}
