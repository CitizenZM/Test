// Maps to existing Supabase publishers table
export interface Publisher {
  id: number;
  publisher_name: string;
  website: string | null;
  domain: string | null;
  contact_email: string | null;
  contact_name: string | null;
  affiliate_network: string | null;
  affiliate_type: string | null;
  category: string | null;
  tier_priority: string | null;
  estimated_monthly_visits: number | null;
  social_linkedin: string | null;
  description: string | null;
  summary_note: string | null;
  modeled_roas: number | null;
  domain_authority: number | null;
  historical_gmv: number | null;
  historical_transactions: number | null;
  historical_clicks: number | null;
  historical_roi: number | null;
  historical_cvr: number | null;
  countries: string | null;
  onboarding_priority: string | null;
  created_at: string;
  updated_at: string;
  // Computed/virtual fields for our UI
  name?: string;
  email?: string;
  linkedin?: string;
  traffic_estimate?: number;
  content_type?: string;
  affiliate_friendly?: boolean;
  publisher_score?: number;
  affiliate_fit_score?: number;
  traffic_score?: number;
  audience?: string;
  notes?: string;
}

// Helper to normalize publisher data for our UI
export function normalizePublisher(p: Publisher): Publisher {
  return {
    ...p,
    name: p.publisher_name || p.domain || 'Unknown',
    email: p.contact_email || undefined,
    linkedin: p.social_linkedin || undefined,
    traffic_estimate: p.estimated_monthly_visits || undefined,
    content_type: p.affiliate_type || undefined,
    affiliate_friendly: !!p.affiliate_network,
    publisher_score: p.modeled_roas ? Math.min(Math.round(p.modeled_roas * 20), 100) : 0,
    affiliate_fit_score: p.historical_cvr ? Math.min(Math.round(p.historical_cvr), 100) : 0,
    traffic_score: p.domain_authority || 0,
    audience: p.description || undefined,
    notes: p.summary_note || undefined,
  };
}

export interface Campaign {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  sequence: SequenceStep[];
  created_at: string;
  updated_at: string;
}

export interface SequenceStep {
  step: number;
  action: 'connect' | 'message' | 'follow_up' | 'email';
  channel: 'linkedin' | 'email';
  day: number;
}

export type OutreachStatus = 'lead' | 'contacted' | 'replied' | 'meeting' | 'partner' | 'active';

export interface Outreach {
  id: string;
  publisher_id: number;
  campaign_id: string | null;
  status: OutreachStatus;
  channel: 'linkedin' | 'email' | null;
  message: string | null;
  reply: string | null;
  sent_at: string | null;
  replied_at: string | null;
  next_follow_up: string | null;
  created_at: string;
  updated_at: string;
  publisher?: Publisher;
  campaign?: Campaign;
}

export interface DiscoverRequest {
  keyword: string;
  category?: string;
  product?: string;
}

export interface OutreachGenerateRequest {
  publisher: Publisher;
  channel: 'linkedin' | 'email';
  campaign?: Campaign;
  tone?: 'professional' | 'casual' | 'friendly';
}

export interface AnalyzeRequest {
  website: string;
  name: string;
}

export interface AnalyticsData {
  leadsDiscovered: number;
  outreachSent: number;
  replies: number;
  meetings: number;
  partners: number;
  activePartners: number;
  replyRate: number;
  partnerConversion: number;
}

export const PIPELINE_STAGES: { key: OutreachStatus; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'bg-gray-500' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { key: 'replied', label: 'Replied', color: 'bg-yellow-500' },
  { key: 'meeting', label: 'Meeting', color: 'bg-purple-500' },
  { key: 'partner', label: 'Partner', color: 'bg-green-500' },
  { key: 'active', label: 'Active', color: 'bg-emerald-500' },
];
