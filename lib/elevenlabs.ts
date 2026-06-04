if (!process.env.ELEVENLABS_API_KEY) {
  console.warn('ELEVENLABS_API_KEY is not set');
}

if (!process.env.ELEVENLABS_VOICE_ID) {
  console.warn('ELEVENLABS_VOICE_ID is not set');
}

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!voiceId || !apiKey) {
    throw new Error('ElevenLabs credentials are missing');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.arrayBuffer();
}
