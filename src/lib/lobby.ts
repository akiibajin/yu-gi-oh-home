import getAdminClient from "@/config/supabase";

export interface Lobby {
	id: string;
	host_user_id: string | null;
	lobby_code: string;
	created_at: string;
	updated_at: string;
	is_active: boolean;
	timer_seconds: number;
	timer_running: boolean;
	timer_last_update: string;
	best_of: number;
	current_game: number;
}

export interface LobbyPlayer {
	id: string;
	lobby_id: string;
	player_name: string;
	life_points: number;
	is_host: boolean;
	avatar_url: string | null;
	created_at: string;
	updated_at: string;
	games_won: number;
}

export interface DuelHistory {
	id: string;
	lobby_id: string;
	game_number: number;
	winner_player_id: string | null;
	duration_seconds: number | null;
	host_final_lp: number | null;
	guest_final_lp: number | null;
	completed_at: string;
	notes: string | null;
}

export interface DiceRoll {
	id: string;
	lobby_id: string;
	player_id: string | null;
	player_name: string | null;
	roll_type: "coin" | "d6" | "d20";
	result: string;
	rolled_at: string;
}

// Get all active lobbies
export async function getActiveLobbies(): Promise<Lobby[]> {
	try {
		const client = await getAdminClient();
		const { data, error } = await client
			.from("lobbies")
			.select()
			.eq("is_active", true)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching active lobbies:", error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error("Error in getActiveLobbies:", error);
		return [];
	}
}

// Generate a random 6-character lobby code
function generateLobbyCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

// Create a new lobby
export async function createLobby(
	hostName: string,
	avatarUrl?: string,
	userId?: string,
): Promise<{ lobby: Lobby; player: LobbyPlayer } | null> {
	try {
		const client = await getAdminClient();
		const lobbyCode = generateLobbyCode();

		// Create lobby
		const { data: lobby, error: lobbyError } = await client
			.from("lobbies")
			.insert({
				host_user_id: userId || null,
				lobby_code: lobbyCode,
			})
			.select()
			.single();

		if (lobbyError || !lobby) {
			console.error("Error creating lobby:", lobbyError);
			return null;
		}

		// Create host player
		const { data: player, error: playerError } = await client
			.from("lobby_players")
			.insert({
				lobby_id: lobby.id,
				player_name: hostName,
				is_host: true,
				life_points: 8000,
				avatar_url: avatarUrl || null,
			})
			.select()
			.single();

		if (playerError || !player) {
			console.error("Error creating host player:", playerError);
			return null;
		}

		return { lobby, player };
	} catch (error) {
		console.error("Error in createLobby:", error);
		return null;
	}
}

// Join an existing lobby
export async function joinLobby(
	lobbyCode: string,
	playerName: string,
	avatarUrl?: string,
): Promise<{ lobby: Lobby; player: LobbyPlayer } | null> {
	try {
		const client = await getAdminClient();

		// Find lobby by code
		const { data: lobby, error: lobbyError } = await client
			.from("lobbies")
			.select()
			.eq("lobby_code", lobbyCode.toUpperCase())
			.eq("is_active", true)
			.single();

		if (lobbyError || !lobby) {
			console.error("Error finding lobby:", lobbyError);
			return null;
		}

		// Create player
		const { data: player, error: playerError } = await client
			.from("lobby_players")
			.insert({
				lobby_id: lobby.id,
				player_name: playerName,
				is_host: false,
				life_points: 8000,
				avatar_url: avatarUrl || null,
			})
			.select()
			.single();

		if (playerError || !player) {
			console.error("Error creating player:", playerError);
			return null;
		}

		return { lobby, player };
	} catch (error) {
		console.error("Error in joinLobby:", error);
		return null;
	}
}

// Get all players in a lobby
export async function getLobbyPlayers(lobbyId: string): Promise<LobbyPlayer[]> {
	try {
		const client = await getAdminClient();
		const { data, error } = await client
			.from("lobby_players")
			.select()
			.eq("lobby_id", lobbyId)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching lobby players:", error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error("Error in getLobbyPlayers:", error);
		return [];
	}
}

// Update player life points
export async function updatePlayerLifePoints(
	playerId: string,
	lifePoints: number,
): Promise<boolean> {
	try {
		const client = await getAdminClient();
		const { error } = await client
			.from("lobby_players")
			.update({ life_points: lifePoints })
			.eq("id", playerId);

		if (error) {
			console.error("Error updating life points:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in updatePlayerLifePoints:", error);
		return false;
	}
}

// Subscribe to lobby player changes
export async function subscribeLobbyPlayers(
	lobbyId: string,
	callback: (players: LobbyPlayer[]) => void,
) {
	try {
		const client = await getAdminClient();

		const channel = client
			.channel(`lobby_${lobbyId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "lobby_players",
					filter: `lobby_id=eq.${lobbyId}`,
				},
				async () => {
					// Fetch updated players
					const players = await getLobbyPlayers(lobbyId);
					callback(players);
				},
			)
			.subscribe();

		return channel;
	} catch (error) {
		console.error("Error in subscribeLobbyPlayers:", error);
		return null;
	}
}

// Close a lobby
export async function closeLobby(lobbyId: string): Promise<boolean> {
	try {
		const client = await getAdminClient();
		const { error } = await client
			.from("lobbies")
			.update({ is_active: false })
			.eq("id", lobbyId);

		if (error) {
			console.error("Error closing lobby:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in closeLobby:", error);
		return false;
	}
}

// Get lobby by id
export async function getLobby(lobbyId: string): Promise<Lobby | null> {
	try {
		const client = await getAdminClient();
		const { data, error } = await client
			.from("lobbies")
			.select()
			.eq("id", lobbyId)
			.single();

		if (error) {
			console.error("Error fetching lobby:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("Error in getLobby:", error);
		return null;
	}
}

// Timer controls
export async function startTimer(lobbyId: string): Promise<boolean> {
	try {
		const client = await getAdminClient();
		const { error } = await client
			.from("lobbies")
			.update({
				timer_running: true,
				timer_last_update: new Date().toISOString(),
			})
			.eq("id", lobbyId);

		if (error) {
			console.error("Error starting timer:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in startTimer:", error);
		return false;
	}
}

export async function pauseTimer(lobbyId: string): Promise<boolean> {
	try {
		const client = await getAdminClient();
		const lobby = await getLobby(lobbyId);
		if (!lobby) return false;

		// Calculate elapsed time since last update
		const now = new Date();
		const lastUpdate = new Date(lobby.timer_last_update);
		const elapsedSeconds = Math.floor(
			(now.getTime() - lastUpdate.getTime()) / 1000,
		);
		const newSeconds =
			lobby.timer_seconds + (lobby.timer_running ? elapsedSeconds : 0);

		const { error } = await client
			.from("lobbies")
			.update({
				timer_running: false,
				timer_seconds: newSeconds,
				timer_last_update: now.toISOString(),
			})
			.eq("id", lobbyId);

		if (error) {
			console.error("Error pausing timer:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in pauseTimer:", error);
		return false;
	}
}

export async function resetTimer(lobbyId: string): Promise<boolean> {
	try {
		const client = await getAdminClient();
		const { error } = await client
			.from("lobbies")
			.update({
				timer_seconds: 0,
				timer_running: false,
				timer_last_update: new Date().toISOString(),
			})
			.eq("id", lobbyId);

		if (error) {
			console.error("Error resetting timer:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in resetTimer:", error);
		return false;
	}
}

// Subscribe to lobby changes (for timer updates)
export async function subscribeLobby(
	lobbyId: string,
	callback: (lobby: Lobby) => void,
) {
	try {
		const client = await getAdminClient();

		const channel = client
			.channel(`lobby_meta_${lobbyId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "lobbies",
					filter: `id=eq.${lobbyId}`,
				},
				async () => {
					const lobby = await getLobby(lobbyId);
					if (lobby) callback(lobby);
				},
			)
			.subscribe();

		return channel;
	} catch (error) {
		console.error("Error in subscribeLobby:", error);
		return null;
	}
}

// Match tracking
export async function recordGameResult(
	lobbyId: string,
	winnerId: string,
	hostFinalLp: number,
	guestFinalLp: number,
	durationSeconds: number,
): Promise<boolean> {
	try {
		const client = await getAdminClient();
		const lobby = await getLobby(lobbyId);
		if (!lobby) return false;

		// Record in duel history
		const { error: historyError } = await client.from("duel_history").insert({
			lobby_id: lobbyId,
			game_number: lobby.current_game,
			winner_player_id: winnerId,
			duration_seconds: durationSeconds,
			host_final_lp: hostFinalLp,
			guest_final_lp: guestFinalLp,
		});

		if (historyError) {
			console.error("Error recording duel history:", historyError);
			return false;
		}

		// Update winner's game count
		const winner = await client
			.from("lobby_players")
			.select()
			.eq("id", winnerId)
			.single();

		if (winner.data) {
			await client
				.from("lobby_players")
				.update({ games_won: (winner.data.games_won || 0) + 1 })
				.eq("id", winnerId);
		}

		// Update current game number
		const newGameNumber = lobby.current_game + 1;
		if (newGameNumber <= lobby.best_of) {
			await client
				.from("lobbies")
				.update({ current_game: newGameNumber })
				.eq("id", lobbyId);
		}

		return true;
	} catch (error) {
		console.error("Error in recordGameResult:", error);
		return false;
	}
}

export async function updateMatchFormat(
	lobbyId: string,
	bestOf: number,
): Promise<boolean> {
	try {
		const client = await getAdminClient();
		const { error } = await client
			.from("lobbies")
			.update({ best_of: bestOf, current_game: 1 })
			.eq("id", lobbyId);

		if (error) {
			console.error("Error updating match format:", error);
			return false;
		}

		// Reset all player game counts
		await client
			.from("lobby_players")
			.update({ games_won: 0 })
			.eq("lobby_id", lobbyId);

		return true;
	} catch (error) {
		console.error("Error in updateMatchFormat:", error);
		return false;
	}
}

// Dice rolls and coin flips
export async function recordDiceRoll(
	lobbyId: string,
	playerId: string | null,
	playerName: string | null,
	rollType: "coin" | "d6" | "d20",
	result: string,
): Promise<boolean> {
	try {
		const client = await getAdminClient();
		const { error } = await client.from("dice_rolls").insert({
			lobby_id: lobbyId,
			player_id: playerId,
			player_name: playerName,
			roll_type: rollType,
			result,
		});

		if (error) {
			console.error("Error recording dice roll:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error in recordDiceRoll:", error);
		return false;
	}
}

export async function getDiceRolls(lobbyId: string): Promise<DiceRoll[]> {
	try {
		const client = await getAdminClient();
		const { data, error } = await client
			.from("dice_rolls")
			.select()
			.eq("lobby_id", lobbyId)
			.order("rolled_at", { ascending: false })
			.limit(20);

		if (error) {
			console.error("Error fetching dice rolls:", error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error("Error in getDiceRolls:", error);
		return [];
	}
}

// Duel history
export async function getDuelHistory(lobbyId: string): Promise<DuelHistory[]> {
	try {
		const client = await getAdminClient();
		const { data, error } = await client
			.from("duel_history")
			.select()
			.eq("lobby_id", lobbyId)
			.order("completed_at", { ascending: false });

		if (error) {
			console.error("Error fetching duel history:", error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error("Error in getDuelHistory:", error);
		return [];
	}
}

// Get host player for a lobby
export async function getHostPlayer(
	lobbyId: string,
): Promise<LobbyPlayer | null> {
	try {
		const client = await getAdminClient();
		const { data, error } = await client
			.from("lobby_players")
			.select()
			.eq("lobby_id", lobbyId)
			.eq("is_host", true)
			.single();

		if (error) {
			console.error("Error fetching host player:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("Error in getHostPlayer:", error);
		return null;
	}
}
