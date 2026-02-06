export type SplitPendulumDescriptionResult = {
	pendulumDescription: string;
	monsterDescription: string;
	didSplit: boolean;
};

function normalizeNewlines(text: string) {
	return text.replace(/\r\n?/g, "\n");
}

function trimBlankLines(text: string) {
	// Trim whitespace, then remove leading/trailing blank lines without touching inner formatting.
	const normalized = normalizeNewlines(text).trim();
	return normalized
		.replace(/^(\s*\n)+/g, "")
		.replace(/(\n\s*)+$/g, "");
}

/**
 * Splits a single "combined" description into Pendulum Effect and Monster Effect.
 *
 * Supports common formats like:
 * - [ Pendulum Effect ] ... [ Monster Effect ] ...
 * - [Pendulum Effect] ... [Monster Effect] ...
 *
 * If headers are not found, returns { didSplit: false } and leaves text as monsterDescription.
 */
export function splitPendulumDescription(
	rawText: string,
): SplitPendulumDescriptionResult {
	const raw = rawText ?? "";
	const text = trimBlankLines(raw);
	if (!text) {
		return {
			pendulumDescription: "",
			monsterDescription: "",
			didSplit: false,
		};
	}

	const pendulumHeader = /\[\s*pendulum\s+effect\s*\]/i;
	const monsterHeader = /\[\s*monster\s+effect\s*\]/i;

	const pendulumMatch = pendulumHeader.exec(text);
	const monsterMatch = monsterHeader.exec(text);

	if (!pendulumMatch || !monsterMatch) {
		return {
			pendulumDescription: "",
			monsterDescription: text,
			didSplit: false,
		};
	}

	const pIndex = pendulumMatch.index;
	const mIndex = monsterMatch.index;
	if (pIndex > mIndex) {
		// Unexpected order; don't guess.
		return {
			pendulumDescription: "",
			monsterDescription: text,
			didSplit: false,
		};
	}

	const pendulumStart = pIndex + pendulumMatch[0].length;
	const monsterStart = mIndex + monsterMatch[0].length;

	const pendulumPart = trimBlankLines(text.slice(pendulumStart, mIndex));
	const monsterPart = trimBlankLines(text.slice(monsterStart));

	return {
		pendulumDescription: pendulumPart,
		monsterDescription: monsterPart,
		didSplit: true,
	};
}
