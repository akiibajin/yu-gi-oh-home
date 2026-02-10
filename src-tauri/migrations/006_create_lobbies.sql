-- Create lobbies table
CREATE TABLE IF NOT EXISTS lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    lobby_code VARCHAR(8) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create lobby_players table
CREATE TABLE IF NOT EXISTS lobby_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    player_name VARCHAR(100) NOT NULL,
    life_points INTEGER DEFAULT 8000,
    is_host BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lobbies_code ON lobbies(lobby_code);
CREATE INDEX IF NOT EXISTS idx_lobbies_active ON lobbies(is_active);
CREATE INDEX IF NOT EXISTS idx_lobby_players_lobby_id ON lobby_players(lobby_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_lobbies_updated_at BEFORE UPDATE ON lobbies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lobby_players_updated_at BEFORE UPDATE ON lobby_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
