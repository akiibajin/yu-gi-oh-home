export function clampInt(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, Math.trunc(value)));
}
