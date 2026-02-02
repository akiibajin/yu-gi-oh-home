-- Adds Link monster fields introduced in the TS draft type.

ALTER TABLE yugioh_cards
  ADD COLUMN IF NOT EXISTS link_rating INTEGER;

-- Stores link marker names (e.g. "Top", "Bottom-left").
ALTER TABLE yugioh_cards
  ADD COLUMN IF NOT EXISTS link_markers TEXT[];
