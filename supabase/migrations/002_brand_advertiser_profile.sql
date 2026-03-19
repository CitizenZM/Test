-- Add advertiser profile fields to brand_profiles
ALTER TABLE brand_profiles
  ADD COLUMN IF NOT EXISTS competitors JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS recruitment_strategy JSONB,
  ADD COLUMN IF NOT EXISTS strategy_generated_at TIMESTAMPTZ;

-- Index for faster brand profile lookups
CREATE INDEX IF NOT EXISTS idx_brand_profiles_brand_id ON brand_profiles(brand_id);
