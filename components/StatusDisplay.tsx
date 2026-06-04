import { OrbState } from './OrbAnimation';

interface StatusDisplayProps {
  state: OrbState;
}

export function StatusDisplay({ state }: StatusDisplayProps) {
  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      case 'idle':
      default:
        return 'Click to speak';
    }
  };

  return (
    <div className="text-cyan-400 font-mono text-lg tracking-widest uppercase mt-8 animate-pulse">
      {getStatusText()}
    </div>
  );
}
