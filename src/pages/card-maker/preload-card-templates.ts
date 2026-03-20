const CARD_TEMPLATES_BASE_URL =
	"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/card-templates/";

const cardTemplateUrl = (fileName: string) =>
	`${CARD_TEMPLATES_BASE_URL}${fileName}`;

// Local (bundled) card-maker-only template assets.
import number0 from "@/assets/images/card-templates/number-0.webp";
import number1 from "@/assets/images/card-templates/number-1.webp";
import number2 from "@/assets/images/card-templates/number-2.webp";
import number3 from "@/assets/images/card-templates/number-3.webp";
import number4 from "@/assets/images/card-templates/number-4.webp";
import number5 from "@/assets/images/card-templates/number-5.webp";
import number6 from "@/assets/images/card-templates/number-6.webp";
import number7 from "@/assets/images/card-templates/number-7.webp";
import number8 from "@/assets/images/card-templates/number-8.webp";
import number9 from "@/assets/images/card-templates/number-9.webp";

import greenGem from "@/assets/images/card-templates/green-gem.webp";
import yellowGem from "@/assets/images/card-templates/yellow-gem.webp";

import scale0 from "@/assets/images/card-templates/scale-0.webp";
import scale1 from "@/assets/images/card-templates/scale-1.webp";
import scale2 from "@/assets/images/card-templates/scale-2.webp";
import scale3 from "@/assets/images/card-templates/scale-3.webp";
import scale4 from "@/assets/images/card-templates/scale-4.webp";
import scale5 from "@/assets/images/card-templates/scale-5.webp";
import scale6 from "@/assets/images/card-templates/scale-6.webp";
import scale7 from "@/assets/images/card-templates/scale-7.webp";
import scale8 from "@/assets/images/card-templates/scale-8.webp";
import scale9 from "@/assets/images/card-templates/scale-9.webp";

import rank from "@/assets/images/card-templates/rank.webp";
import star from "@/assets/images/card-templates/star.webp";
import tunerStar from "@/assets/images/card-templates/tuner-star.webp";

import cristal3 from "@/assets/images/card-templates/cristal-3.webp";
import cristal4 from "@/assets/images/card-templates/cristal-4.webp";
import cristal5 from "@/assets/images/card-templates/cristal 5.webp";
import cristal6 from "@/assets/images/card-templates/cristal 6.webp";
import cristal7 from "@/assets/images/card-templates/cristal 7.webp";

const REMOTE_TEMPLATE_FILE_NAMES = [
	// Card textures
	"normal-description.webp",
	"normal-border.webp",
	"stats-normal.webp",
	"effect-description.webp",
	"effect-border.webp",
	"stats-effect.webp",
	"ritual-description.webp",
	"ritual-border.webp",
	"stats-ritual.webp",
	"fusion-description.webp",
	"fusion-border.webp",
	"stats-fusion.webp",
	"synchro-description.webp",
	"synchro-border.webp",
	"stats-synchro.webp",
	"xyz-description.webp",
	"xyz-border.webp",
	"stats-xyz.webp",
	"link-description.webp",
	"link-border.webp",
	"stats-link.webp",
	"spell-description.webp",
	"spell-border.webp",
	"trap-description.webp",
	"trap-border.webp",
	"stats-trap.webp",
	"field-description.webp",
	"field-border.webp",
	"token-description.webp",
	"token-border.webp",
	"stats-token.webp",
	"effect-pendulum-border.webp",
	"normal-pendulum-border.webp",
	"fusion-pendulum-border.webp",
	"synchro-pendulum-border.webp",
	"xyz-pendulum-border.webp",
	"ritual-pendulum-border.webp",

	// Attributes
	"dark.webp",
	"light.webp",
	"earth.webp",
	"water.webp",
	"fire.webp",
	"wind.webp",
	"divine.webp",

	// Spell/Trap icons
	"normal.webp",
	"continuos.webp",
	"equip.webp",
	"quick-spell.webp",
	"ritual.webp",
	"field.webp",
	"counter.webp",
] as const;

const CARD_MAKER_TEMPLATE_URLS = [
	...REMOTE_TEMPLATE_FILE_NAMES.map(cardTemplateUrl),

	// Local template assets
	number0,
	number1,
	number2,
	number3,
	number4,
	number5,
	number6,
	number7,
	number8,
	number9,
	greenGem,
	yellowGem,
	scale0,
	scale1,
	scale2,
	scale3,
	scale4,
	scale5,
	scale6,
	scale7,
	scale8,
	scale9,
	rank,
	star,
	tunerStar,
	cristal3,
	cristal4,
	cristal5,
	cristal6,
	cristal7,
] as const;

const preloaded = new Set<string>();
const inflight = new Map<string, Promise<void>>();

const loadImage = (url: string) =>
	new Promise<void>((resolve, reject) => {
		const img = new Image();
		const timeoutId = window.setTimeout(() => {
			reject(new Error(`Timed out loading image: ${url}`));
		}, 15_000);

		const finalizeResolve = () => {
			window.clearTimeout(timeoutId);
			resolve();
		};

		const finalizeReject = (err: Error) => {
			window.clearTimeout(timeoutId);
			reject(err);
		};

		img.decoding = "async";
		img.referrerPolicy = "no-referrer";
		img.onload = () => finalizeResolve();
		img.onerror = () =>
			finalizeReject(new Error(`Failed to load image: ${url}`));
		img.src = url;
		if (img.complete) {
			if (img.naturalWidth > 0) finalizeResolve();
			else finalizeReject(new Error(`Failed to load image: ${url}`));
		}
	});

const preloadImage = (url: string) => {
	if (preloaded.has(url)) return Promise.resolve();
	const existing = inflight.get(url);
	if (existing) return existing;

	const promise = loadImage(url)
		.then(() => {
			preloaded.add(url);
		})
		.finally(() => {
			inflight.delete(url);
		});

	inflight.set(url, promise);
	return promise;
};

let preloadAllPromise: Promise<void> | null = null;

export function preloadCardMakerTemplateImages() {
	if (typeof window === "undefined") return Promise.resolve();
	if (preloadAllPromise) return preloadAllPromise;

	const uniqueUrls = Array.from(new Set<string>(CARD_MAKER_TEMPLATE_URLS));
	preloadAllPromise = Promise.allSettled(uniqueUrls.map(preloadImage)).then(
		() => undefined,
	);
	return preloadAllPromise;
}
