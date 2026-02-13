-- Enable realtime for lobby tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'lobby_players'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_players;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'lobbies'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.lobbies;
    END IF;
END $$;
