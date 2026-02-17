-- Add timer and match tracking to lobbies table
ALTER TABLE lobbies ADD COLUMN IF NOT EXISTS timer_seconds INTEGER DEFAULT 0;
ALTER TABLE lobbies ADD COLUMN IF NOT EXISTS timer_running BOOLEAN DEFAULT false;
ALTER TABLE lobbies ADD COLUMN IF NOT EXISTS timer_last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add match tracking fields
ALTER TABLE lobbies ADD COLUMN IF NOT EXISTS best_of INTEGER DEFAULT 1;
ALTER TABLE lobbies ADD COLUMN IF NOT EXISTS current_game INTEGER DEFAULT 1;

-- Add player match stats
ALTER TABLE lobby_players ADD COLUMN IF NOT EXISTS games_won INTEGER DEFAULT 0;

-- Create duel history table
CREATE TABLE IF NOT EXISTS duel_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    game_number INTEGER NOT NULL,
    winner_player_id UUID REFERENCES lobby_players(id) ON DELETE SET NULL,
    duration_seconds INTEGER,
    host_final_lp INTEGER,
    guest_final_lp INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Create index for duel history
CREATE INDEX IF NOT EXISTS idx_duel_history_lobby_id ON duel_history(lobby_id);
CREATE INDEX IF NOT EXISTS idx_duel_history_winner ON duel_history(winner_player_id);

-- Create dice rolls table for history
CREATE TABLE IF NOT EXISTS dice_rolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    player_id UUID REFERENCES lobby_players(id) ON DELETE SET NULL,
    player_name VARCHAR(100),
    roll_type VARCHAR(20) NOT NULL, -- 'coin', 'd6', 'd20'
    result VARCHAR(50) NOT NULL,
    rolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for dice rolls
CREATE INDEX IF NOT EXISTS idx_dice_rolls_lobby_id ON dice_rolls(lobby_id);
CREATE INDEX IF NOT EXISTS idx_dice_rolls_rolled_at ON dice_rolls(rolled_at DESC);
