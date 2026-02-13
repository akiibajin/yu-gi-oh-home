import { PLAYERS_IMAGES } from "@/lib/constants";

interface AvatarSelectorProps {
	selectedAvatar: string;
	onSelectAvatar: (avatar: string) => void;
}

export function AvatarSelector({
	selectedAvatar,
	onSelectAvatar,
}: AvatarSelectorProps) {
	const avatars = [
		{ name: "Hector", image: PLAYERS_IMAGES.Hector },
		{ name: "Wallys", image: PLAYERS_IMAGES.Wallys },
		{ name: "Hassan", image: PLAYERS_IMAGES.Hassan },
		{ name: "Jess", image: PLAYERS_IMAGES.Jess },
		{ name: "Chauta", image: PLAYERS_IMAGES.Chauta },
		{ name: "Guapo", image: PLAYERS_IMAGES.defaultAvatar },
	];

	return (
		<div>
			<p className="text-sm font-medium mb-2 block">Choose Your Avatar</p>
			<div className="grid grid-cols-3 gap-3">
				{avatars.map((avatar) => (
					<button
						key={avatar.name}
						type="button"
						onClick={() => onSelectAvatar(avatar.image)}
						className={`relative p-2 border-2 rounded-lg transition-all hover:scale-105 ${
							selectedAvatar === avatar.image
								? "border-blue-500 bg-blue-50 dark:bg-blue-950"
								: "border-gray-300 hover:border-gray-400"
						}`}
					>
						<img
							src={avatar.image}
							alt={avatar.name}
							className="w-full h-auto object-contain"
						/>
						<div className="text-xs text-center mt-1 font-medium">
							{avatar.name}
						</div>
						{selectedAvatar === avatar.image && (
							<div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
								✓
							</div>
						)}
					</button>
				))}
			</div>
		</div>
	);
}
