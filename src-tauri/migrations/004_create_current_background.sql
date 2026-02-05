-- Stores a single "current" background used by the app.
-- Enforced as a single-row table via a fixed primary key.

CREATE TABLE IF NOT EXISTS current_background (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL,
  img_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
