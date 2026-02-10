import getAdminClient from "@/config/supabase";

export interface Lobby {
	id: string;
	host_user_id: string | null;
	lobby_code: string;
	created_at: string;
	updated_at: string;
	is_active: boolean;
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
