import { Button } from "@/components/ui/warcraftcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";

async function tryTauriInvoke<T>(cmd: string, args?: Record<string, unknown>) {
	if (typeof window === "undefined") return undefined;
	try {
		return await invoke<T>(cmd, args);
	} catch {
		return undefined;
	}
}

function Home() {
	const { route } = useLocation();
	type SystemStatus = "idle" | "testing" | "online" | "offline";
	const [systemStatus, setSystemStatus] = useState<SystemStatus>("idle");
	const [statusMessage, setStatusMessage] = useState<string>("");
	const [busy, setBusy] = useState(false);

	const test = async () => {
		setBusy(true);
		setSystemStatus("testing");
		setStatusMessage("Probando conexión...");
		try {
			const res = await tryTauriInvoke<void>("db_healthcheck");
			if (res === undefined) {
				setSystemStatus("testing");
				setStatusMessage("La comprobación de estado solo funciona en Tauri.");
				return;
			}
			setSystemStatus("online");
			setStatusMessage("Conexión a la base de datos: OK.");
		} catch {
			setSystemStatus("offline");
			setStatusMessage("Falló la comprobación de la base de datos.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="flex min-h-full w-full justify-center p-1 sm:p-4 md:items-center">
			<div className="w-full max-w-4xl space-y-6">
				<Card className="px-2 sm:px-6">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Herramientas y funciones de duelo</CardTitle>
								<CardDescription>
									Utilidades esenciales para cualquier duelista
								</CardDescription>
							</div>
							<Badge variant="default" faction="none" size="lg">
								ARSENAL
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4 px-10 py-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<Button
								type="button"
								onClick={() => route("/calc")}
								className="flex items-center justify-center text-xs sm:text-sm"
								variant="default"
							>
								⚔️ Calculadora
							</Button>
							<Button
								type="button"
								onClick={() => route("/card-maker")}
								className="flex items-center justify-center"
								variant="default"
							>
								✨ Creador de cartas
							</Button>
							<Button
								type="button"
								onClick={() => route("/fields-bg")}
								className="flex items-center justify-center"
								variant="default"
							>
								🏰 Magias de Campo
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Multiplayer Section */}
				<Card className="px-2 sm:px-6">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Duelo multijugador</CardTitle>
								<CardDescription>
									Desafía oponentes y registra los puntos de vida en tiempo real
								</CardDescription>
							</div>
							<Badge variant="default" faction="none" size="lg">
								PVP
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4 px-10 py-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<Button
								type="button"
								onClick={() => route("/lobby/create")}
								className="flex items-center justify-center"
								variant="default"
							>
								🎪 Crear sala
							</Button>
							<Button
								type="button"
								onClick={() => route("/lobby/join")}
								className="flex items-center justify-center"
								variant="default"
							>
								🔗 Unirse a sala
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* System Status Section */}
				<Card className="px-2 sm:px-6">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Estado del sistema</CardTitle>
							<Badge
								variant={
									systemStatus === "online"
										? "default"
										: systemStatus === "offline"
											? "destructive"
											: "secondary"
								}
								size="sm"
							>
								{systemStatus === "online"
									? "EN LÍNEA"
									: systemStatus === "offline"
										? "FUERA DE LÍNEA"
										: "PROBANDO"}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-3 px-10 py-6">
						<p className="text-sm text-amber-100/70">
							Verifica la conectividad de la base de datos y el estado del
							sistema
						</p>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="frame"
								onClick={test}
								disabled={busy}
								className="px-4 py-2"
							>
								{busy ? "Probando..." : "Probar conexión"}
							</Button>
						</div>
						{statusMessage ? (
							<div
								className={`text-sm px-3 py-2 rounded border ${
									systemStatus === "online"
										? "text-emerald-200 border-emerald-700/50 bg-emerald-950/30"
										: systemStatus === "offline"
											? "text-red-200 border-red-700/50 bg-red-950/30"
											: "text-amber-200 border-amber-700/50 bg-amber-950/30"
								}`}
							>
								{statusMessage}
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default Home;
