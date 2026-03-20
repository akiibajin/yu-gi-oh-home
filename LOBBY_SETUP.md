# Lobby Features Setup

## Database Migration Required

To enable the timer, best-of-3 matches, dice roller, and duel history features, you need to apply the database migration:

### Migration File
`src-tauri/migrations/008_add_timer_and_match_tracking.sql`

This migration adds the following fields to your database:

**lobbies table:**
- `timer_seconds` - Tracks elapsed time
- `timer_running` - Whether timer is active
- `timer_last_update` - Last timer update timestamp
- `best_of` - Match format (1, 3, or 5)
- `current_game` - Current game number in the match

**lobby_players table:**
- `games_won` - Number of games won in the match

**New tables:**
- `duel_history` - Records completed game results
- `dice_rolls` - Tracks coin flips and dice rolls

### How to Apply

If using Supabase, run the SQL in the Supabase SQL editor.

If using a local Postgres database:
```bash
psql -U your_user -d your_database -f src-tauri/migrations/008_add_timer_and_match_tracking.sql
```

### Defensive Code

The components have been updated with defensive code to provide default values if the migration hasn't been run yet:
- Timer will default to 0 seconds, not running
- Match tracker will default to single game format
- All features will work but may show default/empty data until migration is applied

After applying the migration, restart the app to ensure all components load the new fields.

### Presence (required for inactive slot takeover)

To support guest presence tracking (active/inactive) and allow another device to take over an inactive guest slot, add an `active` column to `lobby_players`.

Run this in the Supabase SQL editor (or your Postgres database):

```sql
alter table public.lobby_players
	add column if not exists active boolean not null default true;

-- Optional but recommended for faster lookups.
create index if not exists lobby_players_lobby_id_active_idx
	on public.lobby_players (lobby_id, active);
```

## New Features

### 🕐 Timer
- Start/pause/reset controls
- Syncs across all players in real-time
- Available on both host and guest views

### 🏆 Match Tracking
- Configure match format: Single Game, Best of 3, or Best of 5
- Visual win tracker for each player
- Guest can report game results
- Automatically advances to next game

### 🎲 Dice Roller & Coin Flip
- Coin flip (Heads/Tails)
- D6 dice roll (1-6)
- D20 dice roll (1-20)
- Shows recent roll history

### 📊 Duel History
- Records all completed games
- Shows winner, final life points, duration
- Visible to all players

### 🔑 Host Re-entry
- Hosts can now re-enter their lobby from the lobby list
- Click "Enter as Host" to return to your active lobby
