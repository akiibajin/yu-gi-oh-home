import { useState, useEffect } from "preact/hooks";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
import {
	startTimer,
	pauseTimer,
	resetTimer,
	getLobby,
	type Lobby,
} from "@/lib/lobby";
import { ClockIcon, PlayIcon, PauseIcon, RotateCcwIcon } from "lucide-react";

interface TimerProps {
	lobbyId: string;
	lobby: Lobby;
	onLobbyUpdate: (lobby: Lobby) => void;
}

export function Timer({ lobbyId, lobby, onLobbyUpdate }: TimerProps) {
	const [displaySeconds, setDisplaySeconds] = useState(0);

	// Provide default values if timer fields are missing (migration not run yet)
	const safeTimerSeconds = lobby?.timer_seconds ?? 0;
	const safeTimerRunning = lobby?.timer_running ?? false;
	const safeTimerLastUpdate =
		lobby?.timer_last_update ?? new Date().toISOString();

	useEffect(() => {
		// Calculate current time display
		const calcDisplayTime = () => {
			if (!lobby) return 0;

			let seconds = safeTimerSeconds;

			if (safeTimerRunning) {
				const now = new Date();
				const lastUpdate = new Date(safeTimerLastUpdate);
				const elapsedSeconds = Math.floor(
					(now.getTime() - lastUpdate.getTime()) / 1000,
				);
				seconds += elapsedSeconds;
			}

			return seconds;
		};

		setDisplaySeconds(calcDisplayTime());

		// Update display every second if timer is running
		if (safeTimerRunning) {
			const interval = setInterval(() => {
				setDisplaySeconds(calcDisplayTime());
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [lobby, safeTimerSeconds, safeTimerRunning, safeTimerLastUpdate]);

	const formatTime = (totalSeconds: number): string => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	};

	const handleStart = async () => {
		await startTimer(lobbyId);
		const updated = await getLobby(lobbyId);
		if (updated) onLobbyUpdate(updated);
	};

	const handlePause = async () => {
		await pauseTimer(lobbyId);
		const updated = await getLobby(lobbyId);
		if (updated) onLobbyUpdate(updated);
	};

	const handleReset = async () => {
		await resetTimer(lobbyId);
		const updated = await getLobby(lobbyId);
		if (updated) onLobbyUpdate(updated);
	};

	return (
		<Card>
			<CardContent className="p-4 md:p-6">
				<CardHeader className="px-0 pt-0 pb-4">
					<div className="flex items-center gap-3">
						<ClockIcon className="w-5 h-5 text-amber-400" />
						<CardTitle className="text-lg">Duel Timer</CardTitle>
					</div>
				</CardHeader>

				<div className="mb-4 p-6 bg-slate-950/50 border border-slate-800 rounded-lg text-center">
					<p className="text-4xl md:text-5xl font-bold font-mono text-amber-100">
						{formatTime(displaySeconds)}
					</p>
				</div>

				<div className="flex gap-2">
					{!safeTimerRunning ? (
						<Button
							variant="secondary"
							size="sm"
							onClick={handleStart}
							className="flex-1 flex items-center justify-center gap-2"
						>
							<PlayIcon className="w-4 h-4" />
							Start
						</Button>
					) : (
						<Button
							variant="secondary"
							size="sm"
							onClick={handlePause}
							className="flex-1 flex items-center justify-center gap-2"
						>
							<PauseIcon className="w-4 h-4" />
							Pause
						</Button>
					)}
					<Button
						variant="secondary"
						size="sm"
						onClick={handleReset}
						className="flex items-center justify-center gap-2"
					>
						<RotateCcwIcon className="w-4 h-4" />
						Reset
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
