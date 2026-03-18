import { getAnthropicClient } from './client';
import { Publisher, OutreachGenerateRequest, MessageType, MANAGED_BRANDS } from '@/types';

interface GenerateParams {
  publisher: Publisher;
  channel: 'linkedin' | 'email';
  message_type?: MessageType;
  brand_id?: string;
  brand_name?: string;
  brand_context?: {
    category: string;
    products: string;
    commission_info: string;
    value_props: string[];
  };
  tone?: 'professional' | 'casual' | 'friendly';
}

const BRAND_TEMPLATES: Record<string, { intro: string; products: string; value_props: string[] }> = {
  tcl: {
    intro: 'TCL is a global leader in consumer electronics, known for innovative QD-Mini LED, QLED, and 4K UHD TVs ranging from 43" to 115", plus gaming monitors, NXTPAPER tablets, 5G smartphones, and premium soundbars.',
    products: 'TVs (QD-Mini LED, QLED, 4K UHD), Gaming Monitors, NXTPAPER Tablets, 5G Phones, Soundbars',
    value_props: [
      'Competitive commission rates on high-AOV electronics',
      'Strong brand recognition with innovative display technology',
      'Regular product launches and seasonal promotions',
      'Dedicated affiliate support and creative assets',
    ],
  },
  levoit: {
    intro: 'Levoit, by Vesync, is the #1 air purifier brand in the US. Their product lineup includes True HEPA air purifiers, humidifiers, cordless vacuums, and tower fans — all designed for healthier home living.',
    products: 'Air Purifiers (True HEPA), Humidifiers, Cordless Vacuums, Tower Fans',
    value_props: [
      '#1 selling air purifier brand in the US',
      'Strong Amazon presence with thousands of 5-star reviews',
      'Appeals to health-conscious, pet owner, and allergy sufferer audiences',
      'Competitive pricing with high conversion rates',
    ],
  },
  insta360: {
    intro: 'Insta360 creates innovative 360-degree and action cameras that redefine creative storytelling. From the X4 to the Ace Pro, their cameras are loved by content creators worldwide.',
    products: '360° Cameras (X4, X3), Action Cameras (Ace Pro, GO 3S), AI-Powered Editing',
    value_props: [
      'Premium product with strong margins for affiliates',
      'Highly engaged creator community',
      'Regular product innovation and launches',
      'Content-rich marketing assets',
    ],
  },
};

export async function generateOutreachMessage(params: GenerateParams): Promise<string> {
  const client = getAnthropicClient();
  const { publisher, channel, message_type = 'cold_intro', brand_id, brand_name, brand_context, tone = 'professional' } = params;

  const brandKey = brand_id || 'tcl';
  const brandTemplate = BRAND_TEMPLATES[brandKey] || BRAND_TEMPLATES.tcl;
  const displayBrandName = brand_name || MANAGED_BRANDS.find(b => b.id === brandKey)?.name || 'TCL';

  const publisherInfo = `
- Publisher Name: ${publisher.publisher_name}
- Website/Domain: ${publisher.website || publisher.domain || 'N/A'}
- Category: ${publisher.category || 'N/A'}
- Affiliate Type: ${publisher.affiliate_type || 'N/A'}
- Current Network: ${publisher.affiliate_network || 'N/A'}
- Tier: ${publisher.tier_priority || 'N/A'}
- Est. Monthly Traffic: ${publisher.estimated_monthly_visits ? publisher.estimated_monthly_visits.toLocaleString() : 'N/A'}
- Historical GMV: ${publisher.historical_gmv ? '$' + publisher.historical_gmv.toLocaleString() : 'N/A'}
- Countries: ${publisher.countries || 'N/A'}
- Contact: ${publisher.contact_name || 'N/A'} (${publisher.contact_email || 'N/A'})
- Description: ${publisher.description || 'N/A'}
- TCL Focus Areas: ${publisher.tcl_focus_areas || 'N/A'}`;

  const brandInfo = brand_context
    ? `Brand: ${displayBrandName}\nProducts: ${brand_context.products}\nCommission: ${brand_context.commission_info}\nValue Props: ${brand_context.value_props.join(', ')}`
    : `Brand: ${displayBrandName}\n${brandTemplate.intro}\nProducts: ${brandTemplate.products}\nValue Props: ${brandTemplate.value_props.join(', ')}`;

  const messageTypeInstructions: Record<MessageType, string> = {
    cold_intro: 'Write a compelling cold introduction email/message. Make it personal, reference their content/audience, and propose a partnership.',
    linkedin_connect: 'Write a SHORT LinkedIn connection request (under 300 characters). Be concise and mention why you want to connect.',
    linkedin_inmail: 'Write a LinkedIn InMail (under 1000 characters). More detailed than a connection request, with a clear value proposition.',
    follow_up: 'Write a follow-up message for someone who hasn\'t replied. Be respectful, add new value, and include a softer CTA.',
    partnership_proposal: 'Write a formal partnership proposal. Include commission structure, benefits, expected performance, and next steps.',
    editor_pitch: 'Write a pitch to a specific editor at the publication. Reference their recent work and propose a product review or feature.',
    product_launch: 'Write a product launch announcement. Create urgency, highlight exclusive access, and propose early review opportunity.',
    seasonal_invite: 'Write a seasonal campaign invitation (Black Friday, Prime Day, Holiday). Emphasize limited-time commissions and exclusive deals.',
    commission_offer: 'Write a message highlighting competitive commission rates or a commission increase offer.',
    reengagement: 'Write a re-engagement message for an inactive partner. Acknowledge the gap, share what\'s new, and offer incentives to restart.',
  };

  const prompt = `You are an expert affiliate partnership recruiter for ${displayBrandName}. Generate a personalized ${channel === 'linkedin' ? 'LinkedIn message' : 'email'} to recruit this publisher as an affiliate partner.

${brandInfo}

Publisher details:
${publisherInfo}

Message type: ${message_type}
Instructions: ${messageTypeInstructions[message_type]}

Requirements:
- Channel: ${channel === 'linkedin' ? 'LinkedIn message' : 'Email (include subject line on first line prefixed with "Subject: ")'}
- Tone: ${tone}
- Personalize based on their content, audience, category, and any available data
- Reference specific ${displayBrandName} products relevant to their audience
- Include a clear call to action
- Be concise and genuine — avoid sounding like a template
- If they have historical performance data, subtly reference growth opportunity

Return ONLY the message text, nothing else.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
