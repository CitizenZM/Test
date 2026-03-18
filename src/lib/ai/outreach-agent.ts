import { getAnthropicClient } from './client';
import { Publisher } from '@/types';

interface GenerateParams {
  publisher: Publisher;
  channel: 'linkedin' | 'email';
  tone?: 'professional' | 'casual' | 'friendly';
}

export async function generateOutreachMessage(params: GenerateParams): Promise<string> {
  const client = getAnthropicClient();
  const { publisher, channel, tone = 'professional' } = params;

  const prompt = `You are an expert affiliate partnership recruiter. Generate a personalized ${channel === 'linkedin' ? 'LinkedIn message' : 'email'} to reach out to a potential affiliate publisher.

Publisher details:
- Name: ${publisher.name}
- Website: ${publisher.website || 'N/A'}
- Category: ${publisher.category || 'N/A'}
- Content Type: ${publisher.content_type || 'N/A'}
- Audience: ${publisher.audience || 'N/A'}

Requirements:
- Channel: ${channel === 'linkedin' ? 'LinkedIn DM (keep under 300 characters for connection request, or under 1000 for InMail)' : 'Email (include subject line on first line prefixed with "Subject: ")'}
- Tone: ${tone}
- Personalize based on their content and audience
- Mention specific value proposition for partnership
- Include a clear call to action
- Be concise and genuine — avoid sounding like a template

Return ONLY the message text, nothing else.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
