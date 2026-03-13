import { useState } from "preact/hooks";
import { PLAYERS_IMAGES, TAG_IMAGES } from "@/lib/avatars";

interface AvatarSelectorProps {
	selectedAvatar: string;
	onSelectAvatar: (avatar: string) => void;
}

export function AvatarSelector({
	selectedAvatar,
	onSelectAvatar,
}: AvatarSelectorProps) {
	const [mode, setMode] = useState<"character" | "tag">("character");

	const imageSet = mode === "character" ? PLAYERS_IMAGES : TAG_IMAGES;

	const avatars = Object.entries(imageSet)
		.map(([name, image]) => ({
			name,
			image: image.standing,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	return (
		<div className="min-w-0 space-y-3">
			<div className="flex flex-col md:flex-row items-center justify-between gap-2">
				<p className="block text-sm font-medium">Choose Your Avatar</p>
				<div className="flex gap-1.5 rounded-md border border-border bg-muted/30 p-1">
					<button
						type="button"
						onClick={() => setMode("character")}
						className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
							mode === "character"
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Character
					</button>
					<button
						type="button"
						onClick={() => setMode("tag")}
						className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
							mode === "tag"
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Tag
					</button>
				</div>
			</div>

			<div className="grid max-h-64 min-w-0 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:max-h-96 sm:grid-cols-3 sm:gap-3 sm:pr-2">
				{avatars.map((avatar) => (
					<button
						key={avatar.name}
						type="button"
						onClick={() => onSelectAvatar(avatar.name)}
						aria-pressed={selectedAvatar === avatar.name}
						className={`relative w-full min-w-0 rounded-lg border-2 p-1.5 transition-transform active:scale-[0.98] sm:p-2 ${
							selectedAvatar === avatar.name
								? "border-primary bg-accent/40"
								: "border-border hover:border-muted-foreground/60"
						}`}
					>
						<img
							src={avatar.image}
							alt={avatar.name}
							className="mx-auto h-14 w-full object-contain sm:h-16"
						/>
						<div className="mt-1 hidden md:block truncate text-center text-[11px] font-medium sm:text-xs">
							{avatar.name}
						</div>
						{selectedAvatar === avatar.name && (
							<div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground sm:h-5 sm:w-5 sm:text-xs">
								✓
							</div>
						)}
					</button>
				))}
			</div>
		</div>
	);
}
