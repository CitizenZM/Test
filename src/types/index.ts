// ============================================================
// Publisher — matches real Supabase `publishers` table (13,490 records)
// ============================================================
export interface Publisher {
  id: number;
  priority_rank: number | null;
  publisher_name: string;
  website: string | null;
  domain: string | null;
  contact_email: string | null;
  contact_name: string | null;
  affiliate_network: string | null;
  affiliate_type: string | null;
  category: string | null;
  tier_priority: string | null;
  tcl_focus_areas: string | null;
  historical_gmv: number | null;
  historical_transactions: number | null;
  historical_clicks: number | null;
  historical_roi: number | null;
  historical_cvr: number | null;
  gmv_history_source: string | null;
  countries: string | null;
  research_source_url: string | null;
  estimated_monthly_visits: number | null;
  estimated_placement_fee: number | null;
  estimated_integration_fee: number | null;
  modeled_roas: number | null;
  estimated_paid_return: number | null;
  onboarding_priority: string | null;
  fee_basis: string | null;
  summary_note: string | null;
  created_at: string;
  updated_at: string;
  mau: number | null;
  mau_source: string | null;
  description: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_facebook: string | null;
  alexa_rank: number | null;
  domain_authority: number | null;
  primary_language: string | null;
  headquarters: string | null;
  founded_year: number | null;
  enriched_at: string | null;
  enrichment_status: string | null;
}

// ============================================================
// Publisher Editor — matches `publisher_editors` table
// ============================================================
export interface PublisherEditor {
  id: number;
  publisher_id: number;
  editor_name: string;
  role: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  recent_article_title: string | null;
  recent_article_url: string | null;
  recent_article_date: string | null;
  bio: string | null;
  discovered_at: string;
}

// ============================================================
// Brand — matches `brands` table
// ============================================================
export interface Brand {
  id: string;
  workspace_id: string;
  brand_name: string;
  category: string | null;
  primary_domain: string | null;
  status: string;
  created_at: string;
}

// ============================================================
// Brand Profile — matches `brand_profiles` table
// ============================================================
export interface BrandProfile {
  id: string;
  brand_id: string;
  positioning_summary: string | null;
  audience_summary: string | null;
  pricing_summary: string | null;
  value_props_json: string | null;
  brand_voice_json: string | null;
  ai_confidence: number | null;
  generated_at: string | null;
}

// ============================================================
// Email Log — matches `email_logs` table
// ============================================================
export interface EmailLog {
  id: number;
  publisher_id: number | null;
  publisher_name: string | null;
  to_email: string;
  subject: string;
  body: string;
  status: string;
  resend_id: string | null;
  error_message: string | null;
  sent_at: string | null;
}

// ============================================================
// Campaign
// ============================================================
export type CampaignType = 'recruitment' | 'product_launch' | 'seasonal' | 're_engagement';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  name: string;
  brand_id: string | null;
  brand_name: string | null;
  category: string | null;
  campaign_type: CampaignType;
  status: CampaignStatus;
  sequence: SequenceStep[];
  target_criteria: TargetCriteria | null;
  goals: CampaignGoals | null;
  created_at: string;
  updated_at: string;
}

export interface TargetCriteria {
  categories?: string[];
  tier_priorities?: string[];
  min_traffic?: number;
  countries?: string[];
  has_email?: boolean;
  affiliate_networks?: string[];
}

export interface CampaignGoals {
  target_partners?: number;
  target_gmv?: number;
  target_reply_rate?: number;
}

export interface SequenceStep {
  step: number;
  action: 'connect' | 'message' | 'follow_up' | 'email' | 'proposal';
  channel: 'linkedin' | 'email';
  day: number;
  template?: string;
}

// ============================================================
// Outreach
// ============================================================
export type OutreachStatus = 'lead' | 'contacted' | 'replied' | 'meeting' | 'negotiating' | 'partner' | 'active' | 'declined';

export interface Outreach {
  id: string;
  publisher_id: number;
  campaign_id: string | null;
  brand_id: string | null;
  status: OutreachStatus;
  channel: 'linkedin' | 'email' | null;
  message_type: string | null;
  message: string | null;
  subject: string | null;
  reply: string | null;
  sent_at: string | null;
  replied_at: string | null;
  next_follow_up: string | null;
  created_at: string;
  updated_at: string;
  publisher?: Publisher;
  campaign?: Campaign;
}

// ============================================================
// Outreach message types for TCL / Levoit
// ============================================================
export type MessageType =
  | 'cold_intro'
  | 'linkedin_connect'
  | 'linkedin_inmail'
  | 'follow_up'
  | 'partnership_proposal'
  | 'editor_pitch'
  | 'product_launch'
  | 'seasonal_invite'
  | 'commission_offer'
  | 'reengagement';

export interface OutreachGenerateRequest {
  publisher: Publisher;
  editors?: PublisherEditor[];
  channel: 'linkedin' | 'email';
  message_type: MessageType;
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

// ============================================================
// Analytics
// ============================================================
export interface AnalyticsData {
  leadsDiscovered: number;
  outreachSent: number;
  replies: number;
  meetings: number;
  partners: number;
  activePartners: number;
  replyRate: number;
  partnerConversion: number;
  totalGmv: number;
  avgRoas: number;
  topCategories: { category: string; count: number }[];
}

// ============================================================
// Discovery presets for TCL & Levoit
// ============================================================
export interface DiscoveryPreset {
  id: string;
  name: string;
  brand: string;
  keyword: string;
  category: string;
  description: string;
  icon: string;
}

export const TCL_PRESETS: DiscoveryPreset[] = [
  { id: 'tcl-tv', name: 'TV Review Sites', brand: 'TCL', keyword: 'best TV reviews QD-Mini LED QLED', category: 'TV / Audio Editorial', description: 'Publishers reviewing TVs, home theater, display technology', icon: 'Tv' },
  { id: 'tcl-monitor', name: 'Gaming Monitor Sites', brand: 'TCL', keyword: 'gaming monitor reviews 4K display', category: 'Gaming / PC Editorial', description: 'PC gaming and monitor review publishers', icon: 'Monitor' },
  { id: 'tcl-mobile', name: 'Phone & Tablet Reviewers', brand: 'TCL', keyword: 'smartphone tablet review NXTPAPER 5G', category: 'Mobile / Tablet Editorial', description: 'Mobile device and tablet review sites', icon: 'Smartphone' },
  { id: 'tcl-audio', name: 'Audio & Soundbar Sites', brand: 'TCL', keyword: 'soundbar home audio review', category: 'TV / Audio Editorial', description: 'Home audio and soundbar review publishers', icon: 'Speaker' },
  { id: 'tcl-deals', name: 'Tech Deal Aggregators', brand: 'TCL', keyword: 'tech deals electronics discounts Black Friday', category: 'Deal Sites', description: 'Deal aggregators and discount sites for electronics', icon: 'Tag' },
  { id: 'tcl-smarthome', name: 'Smart Home Publishers', brand: 'TCL', keyword: 'smart home connected devices IoT', category: 'Smart Home Editorial', description: 'Smart home, IoT, and connected device publishers', icon: 'Home' },
];

export const LEVOIT_PRESETS: DiscoveryPreset[] = [
  { id: 'levoit-purifier', name: 'Air Purifier Review Sites', brand: 'Levoit', keyword: 'best air purifier reviews HEPA filter', category: 'Home Appliance Reviews', description: 'Publishers reviewing air purifiers, indoor air quality', icon: 'Wind' },
  { id: 'levoit-home', name: 'Home Appliance Reviewers', brand: 'Levoit', keyword: 'home appliance reviews smart home gadgets', category: 'Home Appliance Reviews', description: 'General home appliance and gadget review sites', icon: 'Home' },
  { id: 'levoit-pet', name: 'Pet Owner Blogs', brand: 'Levoit', keyword: 'pet owner home cleaning air quality pets', category: 'Pet & Lifestyle', description: 'Pet owner blogs interested in air quality and vacuums', icon: 'Heart' },
  { id: 'levoit-health', name: 'Health & Wellness Sites', brand: 'Levoit', keyword: 'indoor air quality allergy asthma health wellness', category: 'Health & Wellness', description: 'Health-focused publishers covering air quality, allergies', icon: 'Activity' },
  { id: 'levoit-vacuum', name: 'Vacuum Review Sites', brand: 'Levoit', keyword: 'cordless vacuum cleaner pet hair review', category: 'Home Appliance Reviews', description: 'Vacuum and floor cleaning review publishers', icon: 'Sparkles' },
  { id: 'levoit-deals', name: 'Home Deals Sites', brand: 'Levoit', keyword: 'home deals discounts appliance coupons Amazon Prime', category: 'Deal Sites', description: 'Home and appliance deal aggregators', icon: 'Tag' },
];

// ============================================================
// Pipeline stages
// ============================================================
export const PIPELINE_STAGES: { key: OutreachStatus; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'bg-gray-500' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { key: 'replied', label: 'Replied', color: 'bg-yellow-500' },
  { key: 'meeting', label: 'Meeting', color: 'bg-purple-500' },
  { key: 'negotiating', label: 'Negotiating', color: 'bg-orange-500' },
  { key: 'partner', label: 'Partner', color: 'bg-green-500' },
  { key: 'active', label: 'Active', color: 'bg-emerald-500' },
  { key: 'declined', label: 'Declined', color: 'bg-red-500' },
];

// ============================================================
// Publisher categories found in the database
// ============================================================
export const PUBLISHER_CATEGORIES = [
  'Tech Editorial / Deals',
  'Tech Editorial / Reviews',
  'Comparison Shopping',
  'Cashback / Loyalty',
  'Coupon / Cashback Browser Extension',
  'Electronics Deal Site',
  'TV / Audio Editorial',
  'Mobile / Tablet Editorial',
  'Mobile / Tablet Tech Editorial',
  'Gaming / PC Editorial',
  'TV / Audio / Gaming Tech Editorial',
  'Smart Home Editorial',
  'Home Appliance Reviews',
  'Health & Wellness',
  'Pet & Lifestyle',
  'Deal Sites',
  'Content Creator / YouTube',
  'Subnetwork',
];

export const TIER_PRIORITIES = ['Tier 1', 'Tier 2', 'Tier 3'];
export const ONBOARDING_PRIORITIES = ['P1 - Immediate', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
export const AFFILIATE_NETWORKS = ['AWIN', 'Impact', 'CJ', 'ShareASale', 'Rakuten', 'PartnerStack', 'AWIN | Impact'];

// ============================================================
// Brand presets for Cell Digital managed brands
// ============================================================
export const MANAGED_BRANDS = [
  { id: 'tcl', name: 'TCL', domain: 'us.tcl.com', category: 'Consumer Electronics', color: '#00A0E9' },
  { id: 'levoit', name: 'Levoit', domain: 'levoit.com', category: 'Home Appliances', color: '#2D9CDB' },
  { id: 'insta360', name: 'Insta360', domain: 'insta360.com', category: 'Cameras & Action Cams', color: '#FFB800' },
];

// ============================================================
// Helper functions
// ============================================================
export function formatTraffic(visits: number | null): string {
  if (!visits) return '-';
  if (visits >= 1_000_000) return `${(visits / 1_000_000).toFixed(1)}M`;
  if (visits >= 1_000) return `${(visits / 1_000).toFixed(0)}K`;
  return visits.toString();
}

export function formatGmv(gmv: number | null): string {
  if (!gmv) return '-';
  if (gmv >= 1_000_000) return `$${(gmv / 1_000_000).toFixed(1)}M`;
  if (gmv >= 1_000) return `$${(gmv / 1_000).toFixed(1)}K`;
  return `$${gmv.toFixed(0)}`;
}

export function getTierColor(tier: string | null): string {
  if (!tier) return 'default';
  if (tier.includes('1')) return 'success';
  if (tier.includes('2')) return 'info';
  return 'default';
}

export function getPriorityColor(p: string | null): 'danger' | 'warning' | 'info' | 'default' {
  if (!p) return 'default';
  if (p.includes('P1')) return 'danger';
  if (p.includes('P2')) return 'warning';
  if (p.includes('P3')) return 'info';
  return 'default';
}
