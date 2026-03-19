-- Full production schema for AffiliateHunter AI
-- Safe to run multiple times (IF NOT EXISTS)

-- Publishers table - full schema matching TypeScript types
CREATE TABLE IF NOT EXISTS publishers (
  id BIGSERIAL PRIMARY KEY,
  priority_rank INTEGER,
  publisher_name TEXT NOT NULL,
  website TEXT,
  domain TEXT,
  contact_email TEXT,
  contact_name TEXT,
  affiliate_network TEXT,
  affiliate_type TEXT,
  category TEXT,
  tier_priority TEXT,
  tcl_focus_areas TEXT,
  historical_gmv NUMERIC,
  historical_transactions INTEGER,
  historical_clicks INTEGER,
  historical_roi NUMERIC,
  historical_cvr NUMERIC,
  gmv_history_source TEXT,
  countries TEXT,
  research_source_url TEXT,
  estimated_monthly_visits INTEGER,
  estimated_placement_fee NUMERIC,
  estimated_integration_fee NUMERIC,
  modeled_roas NUMERIC,
  estimated_paid_return NUMERIC,
  onboarding_priority TEXT,
  fee_basis TEXT,
  summary_note TEXT,
  mau INTEGER,
  mau_source TEXT,
  description TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_facebook TEXT,
  alexa_rank INTEGER,
  domain_authority INTEGER,
  primary_language TEXT,
  headquarters TEXT,
  founded_year INTEGER,
  enriched_at TIMESTAMPTZ,
  enrichment_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
  brand_name TEXT NOT NULL,
  category TEXT,
  primary_domain TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Brand profiles table
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  positioning_summary TEXT,
  audience_summary TEXT,
  pricing_summary TEXT,
  value_props_json JSONB,
  brand_voice_json JSONB,
  ai_confidence NUMERIC,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_name TEXT,
  category TEXT,
  campaign_type TEXT DEFAULT 'recruitment',
  status TEXT DEFAULT 'draft',
  sequence JSONB DEFAULT '[]',
  target_criteria JSONB,
  goals JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Outreach table
CREATE TABLE IF NOT EXISTS outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id BIGINT REFERENCES publishers(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'lead',
  channel TEXT,
  message_type TEXT,
  message TEXT,
  subject TEXT,
  reply TEXT,
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_publishers_category ON publishers(category);
CREATE INDEX IF NOT EXISTS idx_publishers_domain ON publishers(domain);
CREATE INDEX IF NOT EXISTS idx_publishers_network ON publishers(affiliate_network);
CREATE INDEX IF NOT EXISTS idx_publishers_tier ON publishers(tier_priority);
CREATE INDEX IF NOT EXISTS idx_publishers_email ON publishers(contact_email) WHERE contact_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_publishers_enrichment ON publishers(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_brand_id ON brand_profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_outreach_publisher ON outreach(publisher_id);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach(status);
