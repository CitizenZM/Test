import { getAnthropicClient } from './client';
import type { RecruitmentStrategy } from '@/types';

interface DiscoverParams {
  keyword: string;
  category?: string;
  product?: string;
  brand?: string;
  strategy?: RecruitmentStrategy;
}

interface DiscoveredPublisher {
  publisher_name: string;
  website: string;
  category: string;
  affiliate_type: string;
  estimated_monthly_visits: number;
  affiliate_friendly: boolean;
  description: string;
  summary_note: string;
}

export async function discoverPublishers(params: DiscoverParams): Promise<DiscoveredPublisher[]> {
  const client = getAnthropicClient();

  const brandContext = params.brand
    ? `\nBrand context: Finding publishers for ${params.brand} affiliate program.`
    : '';

  const strategyContext = params.strategy
    ? `\n\nAI Recruitment Strategy Context:
- Target categories: ${params.strategy.target_categories.join(', ')}
- Target publisher tags: ${params.strategy.target_publisher_tags.join(', ')}
- Ideal content types: ${params.strategy.ideal_publisher_attributes.content_types.join(', ')}
- Target countries: ${params.strategy.ideal_publisher_attributes.countries.join(', ')}
- Min monthly traffic: ${params.strategy.ideal_publisher_attributes.min_traffic.toLocaleString()}
- Audience fit: ${params.strategy.audience_fit_notes}
Prioritize publishers matching this strategy profile.`
    : '';

  const prompt = `You are an expert affiliate marketing researcher. Find publishers, blogs, media sites, and content creators that would be great affiliate partners.

Search criteria:
- Keyword: ${params.keyword}
${params.category ? `- Category: ${params.category}` : ''}
${params.product ? `- Product focus: ${params.product}` : ''}${brandContext}${strategyContext}

Return exactly 10 publisher recommendations as a JSON array. Each publisher should have:
- publisher_name: Publisher/site name
- website: Website URL
- category: Content category (e.g., "Tech Editorial / Reviews", "Deal Sites", "Cashback / Loyalty")
- affiliate_type: Type of content (e.g., "Reviews", "Deals", "Blog", "News", "Comparison")
- estimated_monthly_visits: Estimated monthly visitors (number)
- affiliate_friendly: Whether they likely accept affiliate partnerships (boolean)
- description: Brief description of their target audience and content
- summary_note: Why they'd be a good affiliate partner

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
      publisher_name: p.publisher_name as string,
      website: p.website as string,
      category: p.category as string,
      affiliate_type: p.affiliate_type as string,
      estimated_monthly_visits: p.estimated_monthly_visits as number,
      affiliate_friendly: p.affiliate_friendly as boolean,
      description: p.description as string,
      summary_note: p.summary_note as string,
    }));
  } catch {
    return [];
  }
}
