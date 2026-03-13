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
import { createLobby } from "@/lib/lobby";
import { AvatarSelector } from "@/components/avatar-selector";
import { CrownIcon } from "lucide-react";
import { PLAYERS_IMAGES } from "@/lib/avatars";

export default function CreateLobby() {
	const { route } = useLocation();
	const [selectedAvatar, setSelectedAvatar] = useState(
		Object.keys(PLAYERS_IMAGES)[0],
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleCreateLobby = async () => {
		if (!selectedAvatar) {
			setError("Selecciona un avatar");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const result = await createLobby(selectedAvatar, selectedAvatar);

			if (result) {
				// Navigate to host display with lobby data
				const url = `/lobby/host/${result.lobby.id}?code=${result.lobby.lobby_code}&playerId=${result.player.id}`;
				console.log("Navigating to:", url);

				route(url);
			} else {
				setError("No se pudo crear la sala. Inténtalo de nuevo.");
			}
		} catch (err) {
			console.error("Error creating lobby:", err);
			setError("Ocurrió un error. Inténtalo de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen p-4">
			<Card className="w-full max-w-md">
				<CardContent className="p-6 md:p-8">
					<CardHeader className="px-0 pt-0">
						<div className="flex items-center gap-3 mb-2">
							<CrownIcon className="w-6 h-6 text-amber-400" />
							<CardTitle>Crear una sala</CardTitle>
							<Badge variant="default" size="sm">
								Anfitrión
							</Badge>
						</div>
						<CardDescription className="px-0">
							Crea una sala nueva e invita a otros a unirse
						</CardDescription>
					</CardHeader>
					<div className="space-y-5 mt-6">
						<div className="space-y-2">
							<label
								className="text-sm font-medium text-amber-100"
								for="hostName"
							>
								Tu nombre
							</label>
							<Input
								id="hostName"
								type="text"
								placeholder="Ingresa tu nombre"
								value={selectedAvatar}
								readOnly
								disabled={loading}
							/>
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
							onClick={handleCreateLobby}
							disabled={loading || !selectedAvatar}
							className="w-full"
						>
							{loading ? "Creando..." : "Crear sala"}
						</Button>

						<Button
							variant="frame"
							onClick={() => {
								route("/lobby/join");
							}}
							className="w-full"
						>
							Unirse a una sala existente
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
