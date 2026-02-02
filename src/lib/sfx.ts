import changeLpUrl from "../assets/media/change-lp.mpeg";
import loseDuelUrl from "../assets/media/lose the duel.mpeg";
import beginDuel from "../assets/media/begin the duel.mpeg";

let changeLpAudio: HTMLAudioElement | null = null;
let loseDuelAudio: HTMLAudioElement | null = null;
let beginDuelAudio: HTMLAudioElement | null = null;

function getAudio(src: string, existing: HTMLAudioElement | null) {
	if (typeof window === "undefined") return null;
	if (existing) return existing;
	const audio = new Audio(src);
	audio.preload = "auto";
	return audio;
}

function play(audio: HTMLAudioElement | null) {
	if (!audio) return;
	try {
		audio.pause();
		audio.currentTime = 0;
		audio.volume = 0.25;
		void audio.play();
	} catch {
		// Ignore playback errors (e.g. autoplay restrictions)
	}
}

export function playLifePointsChangeSfx(nextLifePoints: number) {
	if (nextLifePoints <= 0) {
		loseDuelAudio = getAudio(loseDuelUrl, loseDuelAudio);
		play(loseDuelAudio);
		return;
	}

	changeLpAudio = getAudio(changeLpUrl, changeLpAudio);
	play(changeLpAudio);
}

export function initDuelSfx() {
	beginDuelAudio = getAudio(beginDuel, beginDuelAudio);
	play(beginDuelAudio);
}
