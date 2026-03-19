-- Pixel Office Game Database Schema

-- Game saves table (uses anonymous session IDs for kid-friendly access)
CREATE TABLE IF NOT EXISTS game_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  player_name TEXT DEFAULT 'Player',
  avatar_id INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  office_data JSONB DEFAULT '{}',
  furniture_placed JSONB DEFAULT '[]',
  furniture_inventory JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  total_tasks_completed INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 0,
  play_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  player_name TEXT DEFAULT 'Player',
  score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  furniture_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for kid-friendly gameplay (no auth required)
CREATE POLICY "Allow all operations on game_saves" ON game_saves
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on leaderboard" ON leaderboard
  FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_game_saves_session_id ON game_saves(session_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
