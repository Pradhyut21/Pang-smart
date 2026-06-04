interface TranscriptDisplayProps {
  userTranscript: string;
  jarvisResponse: string;
}

export function TranscriptDisplay({ userTranscript, jarvisResponse }: TranscriptDisplayProps) {
  return (
    <div className="flex flex-col items-center max-w-2xl w-full px-6 mt-8 space-y-6">
      {userTranscript && (
        <div className="text-gray-300 text-center text-xl font-light italic opacity-80">
          &quot;{userTranscript}&quot;
        </div>
      )}
      {jarvisResponse && (
        <div className="text-blue-100 text-center text-2xl font-medium tracking-wide">
          {jarvisResponse}
        </div>
      )}
    </div>
  );
}
