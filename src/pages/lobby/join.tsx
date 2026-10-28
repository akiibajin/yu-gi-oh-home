import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
import { getLobbyByCode, getLobbyPlayers, joinLobby } from "@/lib/lobby";
import { AvatarSelector } from "@/components/avatar-selector";
import { QrCodeIcon, UsersIcon } from "lucide-react";
import { getSafeAvatarImages, PLAYERS_IMAGES } from "@/lib/avatars";
import type { LobbyPlayer } from "@/lib/lobby";
import { Label } from "@/components/ui/warcraftcn/label";
import { QRScanner } from "@/components/qr-scanner";


export default function JoinLobby() {
	const isDev = import.meta.env.DEV;
	const navigate = useNavigate();
	const [lobbyCode, setLobbyCode] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState(
		Object.keys(PLAYERS_IMAGES)[0],
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showScanner, setShowScanner] = useState(false);
	const [inactiveSlots, setInactiveSlots] = useState<LobbyPlayer[]>([]);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [slotsError, setSlotsError] = useState<string>("");

	useEffect(() => {
		let cancelled = false;
		const code = lobbyCode.trim().toUpperCase();
		setSlotsError("");
		if (code.length !== 6) {
			setInactiveSlots([]);
			return;
		}

		const load = async () => {
			setLoadingSlots(true);
			try {
				const lobby = await getLobbyByCode(code);
				if (!lobby) {
					if (!cancelled) setInactiveSlots([]);
					return;
				}
				const players = await getLobbyPlayers(lobby.id);
				const inactive = players.filter(
					(p) => !p.is_host && p.active === false,
				);
				if (!cancelled) setInactiveSlots(inactive);
			} catch (e) {
				console.error(e);
				if (!cancelled) setSlotsError("No se pudieron cargar los cupos.");
			} finally {
				if (!cancelled) setLoadingSlots(false);
			}
		};
		void load();

		return () => {
			cancelled = true;
		};
	}, [lobbyCode]);

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
			const result = await joinLobby(lobbyCode.trim(), selectedAvatar);

			if (result) {
				const url = `/lobby/guest/${result.lobby.id}?playerId=${result.player.id}`;
				if (isDev) console.log("Navigating to:", url);
				navigate(url);
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

	const handleReclaimSlot = async (slotPlayerId: string) => {
		if (!lobbyCode.trim()) {
			setError("Ingresa un código de sala");
			return;
		}
		setLoading(true);
		setError("");
		try {
			// Reclaim existing inactive slot; does not create a new lobby_players row.
			const result = await joinLobby(
				lobbyCode.trim(),
				selectedAvatar,
				undefined,
				slotPlayerId,
			);
			if (!result) {
				setError("No se pudo reingresar. Puede que el jugador ya esté activo.");
				return;
			}
			const url = `/lobby/guest/${result.lobby.id}?playerId=${result.player.id}`;
			navigate(url);
		} catch (err) {
			console.error("Error reclaiming slot:", err);
			setError("Ocurrió un error. Inténtalo de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	const handleQRScan = (scannedCode: string) => {
		setLobbyCode(scannedCode.toUpperCase());
		setShowScanner(false);
	};
	if (isDev) console.log("Selected avatar:", selectedAvatar);
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
							<Label
								className="text-sm font-medium text-amber-100"
								htmlFor="playerName"
							>
								Tu nombre
							</Label>
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
								htmlFor="lobbyCode"
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

						{loadingSlots ? (
							<div className="text-sm text-amber-200/70">
								Buscando cupos inactivos...
							</div>
						) : null}
						{slotsError ? (
							<div className="text-sm text-red-200">{slotsError}</div>
						) : null}
						{inactiveSlots.length > 0 ? (
							<div className="space-y-3 rounded-lg border border-amber-900/30 bg-black/20 p-3">
								<div className="text-sm text-amber-200/70">
									Cupos inactivos disponibles (reingresar):
								</div>
								<div className="grid grid-cols-1 gap-2">
									{inactiveSlots.map((p) => {
										const avatar = getSafeAvatarImages(
											p.player_name || p.avatar_url,
										);
										return (
											<Button
												key={p.id}
												variant="frame"
												onClick={() => handleReclaimSlot(p.id)}
												disabled={loading}
												className="w-full justify-start gap-3"
											>
												<img
													src={avatar.standing}
													alt={p.player_name}
													className="h-10 w-10 object-contain"
												/>
												<span className="truncate">{p.player_name}</span>
											</Button>
										);
									})}
								</div>
							</div>
						) : null}

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
								navigate("/lobby/create");
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
