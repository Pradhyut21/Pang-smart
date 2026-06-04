import { NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/elevenlabs';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const audioBuffer = await generateSpeech(text);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error in Jarvis speak route:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate speech' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
