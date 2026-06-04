import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY is not set');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});
