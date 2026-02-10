import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createLobby } from "@/lib/lobby";
import { AvatarSelector } from "@/components/avatar-selector";
import { PLAYERS_IMAGES } from "@/lib/constants";

export default function CreateLobby() {
	const { route } = useLocation();
	const [hostName, setHostName] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState(PLAYERS_IMAGES.defaultAvatar);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleCreateLobby = async () => {
		if (!hostName.trim()) {
			setError("Please enter your name");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const result = await createLobby(hostName.trim(), selectedAvatar);
			
			if (result) {
				// Navigate to host display with lobby data
				route(`/lobby/host/${result.lobby.id}?code=${result.lobby.lobby_code}&playerId=${result.player.id}`);
			} else {
				setError("Failed to create lobby. Please try again.");
			}
		} catch (err) {
			console.error("Error creating lobby:", err);
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div class="flex items-center justify-center min-h-screen p-4">
			<Card class="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create a Lobby</CardTitle>
					<CardDescription>
						Start a new lobby and invite others to join
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div>
						<label class="text-sm font-medium" for="hostName">
							Your Name
						</label>
						<Input
							id="hostName"
							type="text"
							placeholder="Enter your name"
							value={hostName}
							onInput={(e) => setHostName((e.target as HTMLInputElement).value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									void handleCreateLobby();
								}
							}}
							disabled={loading}
						/>
					</div>

			<AvatarSelector
				selectedAvatar={selectedAvatar}
				onSelectAvatar={setSelectedAvatar}
			/>

		{error && (
			<div class="text-sm text-red-500">{error}</div>
		)}

		<Button
			onClick={handleCreateLobby}
			disabled={loading || !hostName.trim()}
			class="w-full"
		>
			{loading ? "Creating..." : "Create Lobby"}
		</Button>

		<Button
			variant="outline"
			onClick={() => route("/lobby/join")}
			class="w-full"
		>
			Join Existing Lobby Instead
		</Button>
				</CardContent>
			</Card>
		</div>
	);
}
