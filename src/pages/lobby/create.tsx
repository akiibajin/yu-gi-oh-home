import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { Button } from "@/components/ui/warcraftcn/button";
import { Badge } from "@/components/ui/warcraftcn/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { createLobby } from "@/lib/lobby";
import { CrownIcon } from "lucide-react";

const HOST_DISPLAY_NAME = "Host";

export default function CreateLobby() {
	const { route } = useLocation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleCreateLobby = async () => {
		setLoading(true);
		setError("");

		try {
			const result = await createLobby(HOST_DISPLAY_NAME);

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
						{error && (
							<div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
								<p className="text-sm text-red-200">{error}</p>
							</div>
						)}

						<Button
							onClick={handleCreateLobby}
							disabled={loading}
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
