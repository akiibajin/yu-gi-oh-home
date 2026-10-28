import { PLAYERS_NAMES } from "@/lib/avatars";
import { ROYAL_LP, TAG_LP } from "@/lib/constants";
import { initDuelSfx, playLifePointsChangeSfx } from "@/lib/sfx";
import {
	PlayerLifePointsCards,
	type PlayerLifePoints,
} from "@/pages/calc/component/player-life-points-cards";
import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";

function buildPlayers(count: number, names: string[]): PlayerLifePoints[] {
	return Array.from({ length: count }, (_, index) => {
		const n = index + 1;
		const lp = count <= 2 ? TAG_LP : ROYAL_LP;
		return {
			id: String(n),
			name:
				names[index] ??
				PLAYERS_NAMES[(n - 1) % PLAYERS_NAMES.length] ??
				`Player ${n}`,
			lifePoints: lp,
			maxLifePoints: lp,
		};
	});
}

function getSelectedNamesFromQuery(): string[] {
	if (typeof window === "undefined") return [];
	const params = new URLSearchParams(window.location.search);
	return params.getAll("p").filter(Boolean);
}

function Calc() {
	const navigate = useNavigate();
	const params = useParams();
	const numRaw = params["num"]
	const num = numRaw ? Number.parseInt(numRaw, 10) : NaN;

	const isValidNum = Number.isFinite(num) && num > 0;
	const selectedNames = useMemo(() => getSelectedNamesFromQuery(), []);
	const isSetupComplete = isValidNum && selectedNames.length >= num;
	const initialPlayers = useMemo(
		() => (isSetupComplete ? buildPlayers(num, selectedNames) : []),
		[isSetupComplete, num, selectedNames],
	);
	const [players, setPlayers] = useState<PlayerLifePoints[]>(initialPlayers);

	useEffect(() => {
		setPlayers(initialPlayers);
	}, [initialPlayers]);

	useEffect(() => {
		if (!isValidNum) return;
		if (isSetupComplete) return;
		navigate(`/calc/${num}/setup`, { replace: true });
	}, [isValidNum, isSetupComplete, num, navigate]);

	useEffect(() => {
		initDuelSfx();
	}, []);
	return (
		<div className="relative size-full flex flex-1">
			{isValidNum ? (
				<PlayerLifePointsCards
					players={players}
					onUpdatePlayer={(id, nextLifePoints) => {
						setPlayers((prev) => {
							const current = prev.find((p) => p.id === id);
							if (current && current.lifePoints !== nextLifePoints) {
								playLifePointsChangeSfx(nextLifePoints);
							}

							return prev.map((p) =>
								p.id === id ? { ...p, lifePoints: nextLifePoints } : p,
							);
						});
					}}
				/>
			) : null}
		</div>
	);
}

export default Calc;
