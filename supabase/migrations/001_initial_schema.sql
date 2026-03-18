-- Publishers table
CREATE TABLE IF NOT EXISTS publishers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  category TEXT,
  content_type TEXT,
  traffic_estimate INTEGER,
  email TEXT,
  linkedin TEXT,
  affiliate_friendly BOOLEAN DEFAULT false,
  publisher_score INTEGER DEFAULT 0,
  affiliate_fit_score INTEGER DEFAULT 0,
  traffic_score INTEGER DEFAULT 0,
  audience TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  sequence JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Outreach table
CREATE TABLE IF NOT EXISTS outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id UUID REFERENCES publishers(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'contacted', 'replied', 'meeting', 'partner', 'active')),
  channel TEXT CHECK (channel IN ('linkedin', 'email')),
  message TEXT,
  reply TEXT,
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach(status);
CREATE INDEX IF NOT EXISTS idx_outreach_publisher ON outreach(publisher_id);
CREATE INDEX IF NOT EXISTS idx_outreach_campaign ON outreach(campaign_id);
CREATE INDEX IF NOT EXISTS idx_publishers_category ON publishers(category);
CREATE INDEX IF NOT EXISTS idx_publishers_score ON publishers(publisher_score DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_publishers_updated_at
  BEFORE UPDATE ON publishers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_updated_at
  BEFORE UPDATE ON outreach
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
