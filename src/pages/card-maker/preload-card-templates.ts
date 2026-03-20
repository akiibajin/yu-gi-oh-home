const CARD_TEMPLATES_BASE_URL =
	"https://ksaccwfvblnjylviusju.supabase.co/storage/v1/object/public/images/card-templates/";

const cardTemplateUrl = (fileName: string) =>
	`${CARD_TEMPLATES_BASE_URL}${fileName}`;

const number0 = cardTemplateUrl("number-0.webp");
const number1 = cardTemplateUrl("number-1.webp");
const number2 = cardTemplateUrl("number-2.webp");
const number3 = cardTemplateUrl("number-3.webp");
const number4 = cardTemplateUrl("number-4.webp");
const number5 = cardTemplateUrl("number-5.webp");
const number6 = cardTemplateUrl("number-6.webp");
const number7 = cardTemplateUrl("number-7.webp");
const number8 = cardTemplateUrl("number-8.webp");
const number9 = cardTemplateUrl("number-9.webp");

const greenGem = cardTemplateUrl("green-gem.webp");
const yellowGem = cardTemplateUrl("yellow-gem.webp");

const scale0 = cardTemplateUrl("scale-0.webp");
const scale1 = cardTemplateUrl("scale-1.webp");
const scale2 = cardTemplateUrl("scale-2.webp");
const scale3 = cardTemplateUrl("scale-3.webp");
const scale4 = cardTemplateUrl("scale-4.webp");
const scale5 = cardTemplateUrl("scale-5.webp");
const scale6 = cardTemplateUrl("scale-6.webp");
const scale7 = cardTemplateUrl("scale-7.webp");
const scale8 = cardTemplateUrl("scale-8.webp");
const scale9 = cardTemplateUrl("scale-9.webp");

const rank = cardTemplateUrl("rank.webp");
const star = cardTemplateUrl("star.webp");
const tunerStar = cardTemplateUrl("tuner-star.webp");

const cristal3 = cardTemplateUrl("cristal-3.webp");
const cristal4 = cardTemplateUrl("cristal-4.webp");
const cristal5 = cardTemplateUrl("cristal 5.webp");
const cristal6 = cardTemplateUrl("cristal 6.webp");
const cristal7 = cardTemplateUrl("cristal 7.webp");

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
