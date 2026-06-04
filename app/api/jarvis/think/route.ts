import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';

const systemPrompt = `You are Jarvis, an intelligent voice agent.
Parse the user's command and return ONLY a JSON object like this:
{
  intent: 'open_url' | 'search_web' | 'send_message' | 'chat' | 'unknown',
  target: string,
  content: string,
  response: string (what Jarvis should say out loud)
}

Examples:
- 'open Claude' → intent: open_url, target: claude.ai
- 'search for weather in Bangalore' → intent: search_web, target: google.com/search?q=weather+in+Bangalore
- 'chat with me' → intent: chat, response: friendly reply
Never return anything except the JSON object.`;

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: transcript,
        },
      ],
    });

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';

    try {
      const parsedIntent = JSON.parse(responseText);
      return NextResponse.json(parsedIntent);
    } catch (parseError) {
      console.error('Failed to parse Claude JSON response:', responseText, parseError);
      return NextResponse.json({
        intent: 'chat',
        response: 'Sorry, I had trouble understanding that.',
      });
    }
  } catch (error) {
    console.error('Error in Jarvis think route:', error);
    return NextResponse.json(
      {
        intent: 'chat',
        response: 'I encountered an internal error while processing your request.',
      },
      { status: 500 }
    );
  }
}
