import { NextResponse } from 'next/server';

export async function GET() {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    console.error('DEEPGRAM_API_KEY is missing');
    return NextResponse.json(
      { error: 'Deepgram API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://api.deepgram.com/v1/projects/*/keys', {
      method: 'POST',
      headers: {
        Authorization: `Token ${deepgramApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: 'Temporary STT Token',
        scopes: ['usage:write'],
        tags: ['jarvis'],
        time_to_live_in_seconds: 60, // Short-lived token
      }),
    });

    if (!response.ok) {
      // In case we don't have project ID or permissions to create a key, fallback to returning the main API key
      // ONLY DO THIS FOR PROTOTYPE/PHASE 1 - In production, use properly scoped temporary keys
      console.warn("Failed to generate temporary Deepgram token, falling back to DEEPGRAM_API_KEY for Phase 1. Status:", response.status);
      return NextResponse.json({ key: deepgramApiKey });
    }

    const data = await response.json();
    return NextResponse.json({ key: data.key });
  } catch (error) {
    console.error('Error generating Deepgram token:', error);
    // Fallback to main API key for Phase 1 if API call fails
    return NextResponse.json({ key: deepgramApiKey });
  }
}
