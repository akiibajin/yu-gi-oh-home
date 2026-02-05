-- Seeds the default users used by the UI.
-- Uses stable, human-readable IDs (lowercase names).

INSERT INTO users (id, name, icon)
VALUES
  ('hector', 'Hector', NULL),
  ('wallys', 'Wallys', NULL),
  ('hassan', 'Hassan', NULL),
  ('jess',   'Jess',   NULL),
  ('chauta', 'Chauta', NULL)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon;
