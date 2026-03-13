-- Allow ATK/DEF stats like "?" or "∞" by storing them as text.
-- Existing integer values are preserved via ::text casting.

ALTER TABLE yugioh_cards
  ALTER COLUMN atk TYPE TEXT USING atk::text;

ALTER TABLE yugioh_cards
  ALTER COLUMN def TYPE TEXT USING def::text;

-- Keep the old default behavior (0) but as text.
ALTER TABLE yugioh_cards
  ALTER COLUMN atk SET DEFAULT '0';

ALTER TABLE yugioh_cards
  ALTER COLUMN def SET DEFAULT '0';
