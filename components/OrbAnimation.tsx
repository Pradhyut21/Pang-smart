'use client';

import { motion } from 'framer-motion';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface OrbAnimationProps {
  state: OrbState;
}

export function OrbAnimation({ state }: OrbAnimationProps) {
  const getOrbVariants = () => {
    switch (state) {
      case 'listening':
        return {
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
          boxShadow: [
            '0 0 20px #06b6d4', // Cyan
            '0 0 60px #06b6d4',
            '0 0 20px #06b6d4',
          ],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        };
      case 'thinking':
        return {
          rotate: 360,
          scale: 1,
          opacity: 0.9,
          boxShadow: '0 0 30px #3b82f6', // Blue
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear' as const,
          },
        };
      case 'speaking':
        return {
          scale: [1, 1.1, 1.05, 1.15, 1],
          opacity: [0.8, 1, 0.9, 1, 0.8],
          boxShadow: [
            '0 0 20px #3b82f6',
            '0 0 50px #60a5fa',
            '0 0 30px #3b82f6',
          ],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        };
      case 'idle':
      default:
        return {
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.8, 0.6],
          boxShadow: [
            '0 0 10px #3b82f6',
            '0 0 20px #3b82f6',
            '0 0 10px #3b82f6',
          ],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        };
    }
  };

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <motion.div
        animate={getOrbVariants()}
        className={`w-32 h-32 rounded-full border-4 border-blue-500/50 ${
          state === 'thinking' ? 'border-t-cyan-400' : 'bg-blue-600/20'
        }`}
      />
      {state === 'speaking' && (
        <div className="absolute flex gap-1 items-center justify-center">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-cyan-400 rounded-full"
              animate={{
                height: [10, 40, 20, 50, 10],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
