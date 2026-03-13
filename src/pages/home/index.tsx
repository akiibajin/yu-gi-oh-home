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

function Home() {
	const { route } = useLocation();

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
			</div>
		</div>
	);
}

export default Home;
