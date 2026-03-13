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
import { QRScanner } from "@/components/qr-scanner";
import { QrCodeIcon, UsersIcon } from "lucide-react";
import { PLAYERS_IMAGES } from "@/lib/avatars";

export default function JoinLobby() {
	const { route } = useLocation();
	const [lobbyCode, setLobbyCode] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState(
		Object.keys(PLAYERS_IMAGES)[0],
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showScanner, setShowScanner] = useState(false);

	const handleJoinLobby = async () => {
		if (!selectedAvatar.trim()) {
			setError("Selecciona un avatar");
			return;
		}

		if (!lobbyCode.trim()) {
			setError("Ingresa un código de sala");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const result = await joinLobby(
				lobbyCode.trim(),
				selectedAvatar,
				selectedAvatar,
			);

			if (result) {
				const url = `/lobby/guest/${result.lobby.id}?playerId=${result.player.id}`;
				console.log("Navigating to:", url);
				route(url);
			} else {
				setError(
					"No se encontró la sala o ya no está activa. Verifica el código.",
				);
			}
		} catch (err) {
			console.error("Error joining lobby:", err);
			setError("Ocurrió un error. Inténtalo de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	const handleQRScan = (scannedCode: string) => {
		setLobbyCode(scannedCode.toUpperCase());
		setShowScanner(false);
	};
	console.log("Selected avatar:", selectedAvatar);
	return (
		<div className="flex items-center justify-center min-h-screen md:max-w-lg sm:p-4 pb-[env(safe-area-inset-bottom)]">
			<Card className="w-full">
				<CardContent className="p-6 md:p-8">
					<CardHeader className="px-0 pt-0">
						<div className="flex items-center gap-3 mb-2">
							<UsersIcon className="w-6 h-6 text-amber-400" />
							<CardTitle>Unirse a una sala</CardTitle>
							<Badge variant="secondary" size="sm">
								Invitado
							</Badge>
						</div>
						<CardDescription className="px-0">
							Ingresa el código de la sala para unirte a una sesión existente
						</CardDescription>
					</CardHeader>
					<div className="space-y-5 mt-6">
						<div className="space-y-2">
							<label
								className="text-sm font-medium text-amber-100"
								for="playerName"
							>
								Tu nombre
							</label>
							<Input
								id="playerName"
								type="text"
								className="w-full"
								placeholder="Ingresa tu nombre"
								value={selectedAvatar}
								readOnly
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<label
								className="text-sm font-medium text-amber-100"
								for="lobbyCode"
							>
								Código de sala
							</label>
							<div className="flex gap-2">
								<Input
									id="lobbyCode"
									type="text"
									placeholder="Ingresa el código de 6 caracteres"
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
							disabled={loading || !selectedAvatar.trim() || !lobbyCode.trim()}
							className="w-full"
						>
							{loading ? "Uniéndose..." : "Unirse a la sala"}
						</Button>

						<Button
							onClick={() => {
								route("/lobby/create");
							}}
							className="w-full text-[10px]"
						>
							Crear una sala nueva
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
