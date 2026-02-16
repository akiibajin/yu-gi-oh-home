import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { Button } from "@/components/ui/warcraftcn/button";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { Input } from "@/components/ui/warcraftcn/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { joinLobby } from "@/lib/lobby";
import { AvatarSelector } from "@/components/avatar-selector";
import { PLAYERS_IMAGES } from "@/lib/constants";
import { QRScanner } from "@/components/qr-scanner";
import { QrCodeIcon, UsersIcon } from "lucide-react";

export default function JoinLobby() {
	const { route } = useLocation();
	const [playerName, setPlayerName] = useState("");
	const [lobbyCode, setLobbyCode] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState(
		Object.values(PLAYERS_IMAGES)[0],
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
				const url = `/lobby/guest/${result.lobby.id}?playerId=${result.player.id}`;
				console.log("Navigating to:", url);
				route(url);
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
		<div className="flex items-center justify-center min-h-screen p-4">
			<Card className="w-full max-w-md">
				<CardContent className="p-6 md:p-8">
					<CardHeader className="px-0 pt-0">
						<div className="flex items-center gap-3 mb-2">
							<UsersIcon className="w-6 h-6 text-amber-400" />
							<CardTitle>Join a Lobby</CardTitle>
							<Badge variant="secondary" size="sm">
								Guest
							</Badge>
						</div>
						<CardDescription className="px-0">
							Enter the lobby code to join an existing session
						</CardDescription>
					</CardHeader>
					<div className="space-y-5 mt-6">
						<div className="space-y-2">
							<label
								className="text-sm font-medium text-amber-100"
								for="playerName"
							>
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

						<div className="space-y-2">
							<label
								className="text-sm font-medium text-amber-100"
								for="lobbyCode"
							>
								Lobby Code
							</label>
							<div className="flex gap-2">
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
									className="uppercase flex-1"
								/>
								<Button
									variant="frame"
									onClick={() => setShowScanner(true)}
									disabled={loading}
									type="button"
								>
									<QrCodeIcon className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<AvatarSelector
							selectedAvatar={selectedAvatar}
							onSelectAvatar={setSelectedAvatar}
						/>

						{error && (
							<div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
								<p className="text-sm text-red-200">{error}</p>
							</div>
						)}

						<Button
							onClick={handleJoinLobby}
							disabled={loading || !playerName.trim() || !lobbyCode.trim()}
							className="w-full"
						>
							{loading ? "Joining..." : "Join Lobby"}
						</Button>

						<Button
							onClick={() => {
								route("/lobby/create");
							}}
							className="w-full"
						>
							Create New Lobby Instead
						</Button>
					</div>
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
