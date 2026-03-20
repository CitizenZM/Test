import { getOpenAIClient } from './client';
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
  const client = getOpenAIClient();

  const competitorList = params.competitors
    .map((c, i) => `${i + 1}. ${c.name} (${c.url})`)
    .join('\n');

  const prompt = `You are an expert affiliate marketing strategist with deep knowledge of publisher recruitment, affiliate program management, and competitive analysis. Analyze this advertiser brand and their competitors to build a comprehensive publisher recruitment strategy.

Brand: ${params.brand_name}
Website: ${params.brand_url}
Category: ${params.category}

Competitors:
${competitorList || 'None provided'}

Based on this brand and its competitive landscape, create a comprehensive recruitment strategy. Your analysis should be thorough, actionable, and specific to this brand.

Consider deeply:
1. What content categories and publisher types would drive the most revenue for THIS specific brand
2. What keywords to search for when discovering publishers in the affiliate space
3. What publisher attributes indicate a strong fit (traffic volume, content focus, networks, geographic reach)
4. How the brand's target audience overlaps with different publisher audiences
5. What competitors' affiliate strategies reveal about the opportunity landscape
6. How to position the brand's affiliate program to attract top publishers
7. What commission structures and incentives will be most compelling

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

Return ONLY a JSON object with this exact structure. For all text fields, provide detailed, multi-paragraph content (2-3 paragraphs each). Be specific and actionable — avoid generic advice.

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
  "publisher_strategy": "<2-3 paragraphs explaining which specific publisher types (editorial sites, deal aggregators, cashback platforms, content creators, comparison engines, etc.) should be prioritized for this brand and WHY. Reference the brand's product category, price points, purchase consideration cycle, and how each publisher type fits into the customer journey. Be specific about which publisher categories from the database list above are highest priority and explain the strategic rationale.>",
  "recruitment_approach": "<2-3 paragraphs detailing how to position the brand to publishers. What value proposition to lead with (commission rates, brand recognition, conversion rates, exclusive products, seasonal opportunities). What objections publishers might raise and how to counter them. What partnership models to propose (CPA, CPC, hybrid, tenancy/flat fee, product seeding). How to differentiate from competitors' affiliate programs. Include specific talking points for outreach.>",
  "commission_strategy": "<1-2 paragraphs recommending specific commission tiers by publisher type (e.g., editorial sites 8-12%, cashback 3-5%, deal sites 4-6%). Suggest introductory bonus periods (e.g., 2x commission for first 90 days), performance bonuses for hitting GMV targets, seasonal commission bumps, and any other incentive structures that would be effective for this brand's category.>",
  "audience_fit_notes": "<2-3 detailed sentences about ideal audience overlap between the brand and target publishers. Describe the demographic, psychographic, and behavioral characteristics of the brand's ideal customer and how they align with specific publisher audiences.>",
  "competitive_insights": "<2-3 detailed sentences analyzing what competitors' affiliate programs reveal about the opportunity. Which publishers do competitors likely work with? What gaps exist? What commission rates are competitors likely offering? How can this brand differentiate?>",
  "outreach_angle": "<2-3 detailed sentences suggesting the best outreach positioning for this brand. What hook or angle will resonate most with publishers? What timing considerations matter (seasonal, product launches)?>"  ,
  "ai_confidence": <0-100>
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.choices[0]?.message?.content || '{}';

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
    publisher_strategy: '',
    recruitment_approach: '',
    commission_strategy: '',
  };
}
