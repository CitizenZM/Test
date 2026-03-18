import { getAnthropicClient } from './client';

interface ScoreResult {
  publisher_score: number;
  affiliate_fit_score: number;
  traffic_score: number;
  analysis: string;
}

export async function analyzePublisher(name: string, website: string): Promise<ScoreResult> {
  const client = getAnthropicClient();

  const prompt = `You are an expert affiliate marketing analyst. Analyze this publisher for affiliate partnership potential.

Publisher: ${name}
Website: ${website}

Score the publisher on three dimensions (0-100 each):
1. publisher_score: Overall quality and reputation
2. affiliate_fit_score: How well they fit for affiliate partnerships (do they review products, have buying-intent content, accept affiliate links?)
3. traffic_score: Traffic quality and volume estimate

Also provide a brief analysis paragraph.

Return ONLY a JSON object with these fields:
{
  "publisher_score": <number>,
  "affiliate_fit_score": <number>,
  "traffic_score": <number>,
  "analysis": "<string>"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { publisher_score: 50, affiliate_fit_score: 50, traffic_score: 50, analysis: 'Analysis unavailable.' };
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { publisher_score: 50, affiliate_fit_score: 50, traffic_score: 50, analysis: 'Analysis unavailable.' };
  }
}
