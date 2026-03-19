import { getAnthropicClient } from './client';
import type { BrandCompetitor, RecruitmentStrategy } from '@/types';

interface StrategyParams {
  brand_name: string;
  brand_url: string;
  category: string;
  competitors: BrandCompetitor[];
}

export async function generateRecruitmentStrategy(
  params: StrategyParams
): Promise<RecruitmentStrategy> {
  const client = getAnthropicClient();

  const competitorList = params.competitors
    .map((c, i) => `${i + 1}. ${c.name} (${c.url})`)
    .join('\n');

  const prompt = `You are an expert affiliate marketing strategist. Analyze this advertiser brand and their competitors to build a publisher recruitment strategy.

Brand: ${params.brand_name}
Website: ${params.brand_url}
Category: ${params.category}

Competitors:
${competitorList || 'None provided'}

Based on this brand and its competitive landscape, determine what types of affiliate publishers should be recruited. Consider:
1. What content categories and publisher types would drive the most revenue
2. What keywords to search for when discovering publishers
3. What publisher attributes indicate a good fit (traffic, content type, networks, etc.)
4. How the brand's audience overlaps with publisher audiences
5. What competitors' affiliate strategies reveal about the opportunity

Available publisher categories in our database:
- Tech Editorial / Deals
- Tech Editorial / Reviews
- Comparison Shopping
- Cashback / Loyalty
- Coupon / Cashback Browser Extension
- Electronics Deal Site
- TV / Audio Editorial
- Mobile / Tablet Editorial
- Gaming / PC Editorial
- Smart Home Editorial
- Home Appliance Reviews
- Health & Wellness
- Pet & Lifestyle
- Deal Sites
- Content Creator / YouTube
- Subnetwork
- Lifestyle / Travel
- Social Creator - General

Return ONLY a JSON object with this exact structure:
{
  "target_categories": ["category1", "category2", ...],
  "target_publisher_tags": ["tag1", "tag2", ...],
  "discovery_keywords": ["keyword1", "keyword2", ...],
  "ideal_publisher_attributes": {
    "min_traffic": <number>,
    "content_types": ["Reviews", "Deals", ...],
    "affiliate_networks": ["AWIN", "Impact", ...],
    "tier_priorities": ["Tier 1", "Tier 2"],
    "countries": ["US", "UK", ...]
  },
  "audience_fit_notes": "<paragraph about ideal audience overlap>",
  "competitive_insights": "<paragraph about what competitors' affiliate programs reveal>",
  "outreach_angle": "<paragraph suggesting the best outreach positioning for this brand>",
  "ai_confidence": <0-100>
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '{}';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return getDefaultStrategy();
    return JSON.parse(jsonMatch[0]) as RecruitmentStrategy;
  } catch {
    return getDefaultStrategy();
  }
}

function getDefaultStrategy(): RecruitmentStrategy {
  return {
    target_categories: [],
    target_publisher_tags: [],
    discovery_keywords: [],
    ideal_publisher_attributes: {
      min_traffic: 10000,
      content_types: ['Reviews'],
      affiliate_networks: ['AWIN', 'Impact'],
      tier_priorities: ['Tier 1', 'Tier 2'],
      countries: ['US'],
    },
    audience_fit_notes:
      'Strategy generation unavailable. Please try again.',
    competitive_insights: '',
    outreach_angle: '',
    ai_confidence: 0,
  };
}
