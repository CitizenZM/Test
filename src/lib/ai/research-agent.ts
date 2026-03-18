import { getAnthropicClient } from './client';
import { Publisher } from '@/types';

interface DiscoverParams {
  keyword: string;
  category?: string;
  product?: string;
}

export async function discoverPublishers(params: DiscoverParams): Promise<Partial<Publisher>[]> {
  const client = getAnthropicClient();

  const prompt = `You are an expert affiliate marketing researcher. Find publishers, blogs, media sites, and content creators that would be great affiliate partners.

Search criteria:
- Keyword: ${params.keyword}
${params.category ? `- Category: ${params.category}` : ''}
${params.product ? `- Product focus: ${params.product}` : ''}

Return exactly 10 publisher recommendations as a JSON array. Each publisher should have:
- name: Publisher/site name
- website: Website URL
- category: Content category (e.g., "Tech", "Fitness", "Finance")
- content_type: Type of content (e.g., "Reviews", "Deals", "Blog", "News", "Comparison")
- traffic_estimate: Estimated monthly visitors (number)
- affiliate_friendly: Whether they likely accept affiliate partnerships (boolean)
- audience: Brief description of their target audience
- notes: Why they'd be a good affiliate partner

Return ONLY the JSON array, no other text.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const publishers = JSON.parse(jsonMatch[0]);
    return publishers.map((p: Record<string, unknown>) => ({
      name: p.name as string,
      website: p.website as string,
      category: p.category as string,
      content_type: p.content_type as string,
      traffic_estimate: p.traffic_estimate as number,
      affiliate_friendly: p.affiliate_friendly as boolean,
      audience: p.audience as string,
      notes: p.notes as string,
      publisher_score: 0,
      affiliate_fit_score: 0,
      traffic_score: 0,
    }));
  } catch {
    return [];
  }
}
