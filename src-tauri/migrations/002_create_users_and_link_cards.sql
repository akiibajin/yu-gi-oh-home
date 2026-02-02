-- Adds user support and links cards to an (optional) owner.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE yugioh_cards
  ADD COLUMN IF NOT EXISTS user_id TEXT;

DO $$
BEGIN
  -- Add FK only if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'yugioh_cards_user_id_fkey'
  ) THEN
    ALTER TABLE yugioh_cards
      ADD CONSTRAINT yugioh_cards_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_yugioh_cards_user_id ON yugioh_cards(user_id);
