-- Add pendulum scale column to yugioh_cards
ALTER TABLE yugioh_cards
ADD COLUMN scale INTEGER DEFAULT 0;
