import { useEffect } from "preact/hooks";

export function useZoom() {
	useEffect(() => {
		const getCurrentZoom = () => {
			return parseFloat(document.body.style.zoom || "1");
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				if (e.key === "+" || e.key === "=") {
					e.preventDefault();
					const newZoom = Math.min(getCurrentZoom() + 0.1, 3);
					document.body.style.zoom = newZoom.toString();
				} else if (e.key === "-") {
					e.preventDefault();
					const newZoom = Math.max(getCurrentZoom() - 0.1, 0.5);
					document.body.style.zoom = newZoom.toString();
				} else if (e.key === "0") {
					e.preventDefault();
					document.body.style.zoom = "1";
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);
}
