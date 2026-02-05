import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	fetchYgoprodeckCardInfo,
	type YgoprodeckCard,
} from "@/lib/tauri/ygoprodeck";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { useState } from "preact/hooks";
import { toast } from "react-toastify";

interface SearchFormProps {
	user: string;
	handleSaveCard: (cardId: number, cardName: string, imgUrl: string) => void;
}
function SearchForm(props: SearchFormProps) {
	const { user, handleSaveCard } = props;
	const notify = (message: string) => toast(message);
	const [isExactName, setIsExactName] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [query, setQuery] = useState("");
	const [selectCardFound, setSelectCardFound] = useState<null | YgoprodeckCard>(
		null,
	);
	const [cardsFound, setCardsFound] = useState<YgoprodeckCard[]>([]);

	const handleSearch = async () => {
		if (!user) {
			notify("Select a user first");
			return;
		}
		try {
			setIsLoading(true);
			const res = await fetchYgoprodeckCardInfo({
				userName: user,
				name: isExactName ? query : undefined,
				fname: !isExactName ? query : undefined,
			});
			if (!res?.data) {
				setCardsFound([]);
				return;
			}
			const fieldCards = res.data.filter((card) => card.race === "Field");
			setCardsFound(fieldCards);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2 items-center w-full">
				<div className="flex flex-col gap-1 w-full">
					<label htmlFor="search-card">Search Card</label>
					<Input
						id="search-card"
						value={query}
						onInput={(e) => setQuery(e.currentTarget.value)}
					/>
					<div className="flex items-center gap-2">
						<Switch
							id="exact-name-switch"
							checked={isExactName}
							onCheckedChange={setIsExactName}
						/>
						<label htmlFor="exact-name-switch">Exact name match</label>
					</div>
				</div>
				<Button onClick={handleSearch} disabled={isLoading || !query}>
					<SearchIcon />
				</Button>
			</div>
			{isLoading && <Loader2Icon className="animate-spin" />}
			{!!cardsFound.length && (
				<div className="flex flex-col flex-wrap gap-1">
					<span className="w-full font-medium">Pick one card</span>
					<div className="flex flex-wrap gap-2">
						{cardsFound.map((card) => (
							<button
								type="button"
								onClick={() => setSelectCardFound(card)}
								className="flex flex-col gap-1 max-w-26 "
								key={card.id}
							>
								<img
									src={card.card_images?.[0]?.image_url_cropped}
									alt={card.name}
									className="size-24 object-cover"
								/>
								<span className="truncate text-xs font-medium">
									{card.name}
								</span>
							</button>
						))}
					</div>
					{!!selectCardFound && (
						<div className="mt-4">
							<h3 className="font-medium mb-2">Selected Card:</h3>
							<div className="flex flex-col gap-2">
								<img
									src={selectCardFound.card_images?.[0]?.image_url_cropped}
									alt={selectCardFound.name}
								/>
							</div>
							<Button
								onClick={() =>
									handleSaveCard(
										+(selectCardFound.id ?? 0),
										selectCardFound.name ?? "",
										selectCardFound.card_images?.[0]?.image_url_cropped ?? "",
									)
								}
							>
								Save
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default SearchForm;
