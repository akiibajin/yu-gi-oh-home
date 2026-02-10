import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { joinLobby } from "@/lib/lobby";
import { AvatarSelector } from "@/components/avatar-selector";
import { PLAYERS_IMAGES } from "@/lib/constants";
import { QRScanner } from "@/components/qr-scanner";
import { QrCodeIcon } from "lucide-react";

export default function JoinLobby() {
	const { route } = useLocation();
	const [playerName, setPlayerName] = useState("");
	const [lobbyCode, setLobbyCode] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState(
		PLAYERS_IMAGES.defaultAvatar,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showScanner, setShowScanner] = useState(false);

	const handleJoinLobby = async () => {
		if (!playerName.trim()) {
			setError("Please enter your name");
			return;
		}

		if (!lobbyCode.trim()) {
			setError("Please enter a lobby code");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const result = await joinLobby(
				lobbyCode.trim(),
				playerName.trim(),
				selectedAvatar,
			);

			if (result) {
				// Navigate to guest control with player data
				route(`/lobby/guest/${result.lobby.id}?playerId=${result.player.id}`);
			} else {
				setError(
					"Lobby not found or is no longer active. Please check the code.",
				);
			}
		} catch (err) {
			console.error("Error joining lobby:", err);
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleQRScan = (scannedCode: string) => {
		setLobbyCode(scannedCode.toUpperCase());
		setShowScanner(false);
	};

	return (
		<div class="flex items-center justify-center min-h-screen p-4">
			<Card class="w-full max-w-md">
				<CardHeader>
					<CardTitle>Join a Lobby</CardTitle>
					<CardDescription>
						Enter the lobby code to join an existing session
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div>
						<label class="text-sm font-medium" for="playerName">
							Your Name
						</label>
						<Input
							id="playerName"
							type="text"
							placeholder="Enter your name"
							value={playerName}
							onInput={(e) =>
								setPlayerName((e.target as HTMLInputElement).value)
							}
							disabled={loading}
						/>
					</div>

					<div>
						<label class="text-sm font-medium" for="lobbyCode">
							Lobby Code
						</label>
						<div class="flex gap-2">
							<Input
								id="lobbyCode"
								type="text"
								placeholder="Enter 6-character code"
								value={lobbyCode}
								onInput={(e) => {
									const value = (e.target as HTMLInputElement).value;
									setLobbyCode(value.toUpperCase());
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										void handleJoinLobby();
									}
								}}
								maxLength={6}
								disabled={loading}
								class="uppercase flex-1"
							/>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setShowScanner(true)}
								disabled={loading}
								type="button"
							>
								<QrCodeIcon class="h-4 w-4" />
							</Button>
						</div>
					</div>

					<AvatarSelector
						selectedAvatar={selectedAvatar}
						onSelectAvatar={setSelectedAvatar}
					/>

					{error && <div class="text-sm text-red-500">{error}</div>}

					<Button
						onClick={handleJoinLobby}
						disabled={loading || !playerName.trim() || !lobbyCode.trim()}
						class="w-full"
					>
						{loading ? "Joining..." : "Join Lobby"}
					</Button>

					<Button
						variant="outline"
						onClick={() => route("/lobby/create")}
						class="w-full"
					>
						Create New Lobby Instead
					</Button>
				</CardContent>
			</Card>

			{showScanner && (
				<QRScanner
					onScan={handleQRScan}
					onClose={() => setShowScanner(false)}
				/>
			)}
		</div>
	);
}
