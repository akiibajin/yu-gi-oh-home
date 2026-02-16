import { Button } from "@/components/ui/warcraftcn/button";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { Input } from "@/components/ui/warcraftcn/input";
import { Skeleton } from "@/components/ui/warcraftcn/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	fetchYgoprodeckCardInfo,
	type YgoprodeckCard,
} from "@/lib/tauri/ygoprodeck";
import { SearchIcon } from "lucide-react";
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
		<div className="flex flex-col gap-6 mt-2">
			<div className="flex gap-3 items-center w-full flex-col sm:flex-row">
				<div className="flex flex-col gap-2 w-full">
					<label htmlFor="search-card" className="font-medium text-amber-100">
						Search Card
					</label>
					<Input
						id="search-card"
						value={query}
						placeholder="Enter card name..."
						onInput={(e) => setQuery(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !isLoading && query) {
								handleSearch();
							}
						}}
					/>
					<div className="flex items-center gap-2 mt-1">
						<Switch
							id="exact-name-switch"
							checked={isExactName}
							onCheckedChange={setIsExactName}
						/>
						<label htmlFor="exact-name-switch" className="text-sm">
							Exact name match
						</label>
					</div>
				</div>
				<Button
					onClick={handleSearch}
					disabled={isLoading || !query}
					className="w-full sm:w-auto"
				>
					<SearchIcon className="mr-2" />
					Search
				</Button>
			</div>
			{isLoading && (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
					{[...Array(5)].map((_, i) => (
						<Skeleton key={i} className="w-full h-36" />
					))}
				</div>
			)}
			{!!cardsFound.length && !isLoading && (
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-amber-100">Pick one card</span>
						<Badge size="sm">{cardsFound.length} Results</Badge>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
						{cardsFound.map((card) => (
							<div key={card.id} className="relative group">
								<Button
									variant={
										selectCardFound?.id === card.id ? "default" : "frame"
									}
									type="button"
									onClick={() => setSelectCardFound(card)}
									className="flex flex-col gap-2 p-2 w-full h-full transition-transform hover:scale-105"
								>
									<img
										src={card.card_images?.[0]?.image_url_cropped}
										alt={card.name}
										className="w-full h-32 object-cover rounded"
									/>
									<span className="truncate text-xs w-full text-center">
										{card.name}
									</span>
								</Button>
								{selectCardFound?.id === card.id && (
									<div className="absolute -top-2 -right-2">
										<Badge size="sm" variant="default">
											✓
										</Badge>
									</div>
								)}
							</div>
						))}
					</div>
					{!!selectCardFound && (
						<div className="mt-6 p-4 bg-black/20 rounded-lg border border-amber-900/30">
							<div className="flex items-center gap-2 mb-4">
								<h3 className="font-semibold text-amber-100">Selected Card:</h3>
								<Badge variant="default" size="sm">
									Ready to Save
								</Badge>
							</div>
							<div className="flex flex-col sm:flex-row gap-4 items-start">
								<img
									src={selectCardFound.card_images?.[0]?.image_url_cropped}
									alt={selectCardFound.name}
									className="w-full sm:w-40 h-auto rounded-lg shadow-lg border-2 border-amber-700/50"
								/>
								<div className="flex flex-col gap-3 flex-1">
									<div>
										<p className="text-sm text-amber-200 mb-1">Card Name:</p>
										<p className="font-medium">{selectCardFound.name}</p>
									</div>
									<Button
										className="w-full sm:w-auto"
										onClick={() =>
											handleSaveCard(
												+(selectCardFound.id ?? 0),
												selectCardFound.name ?? "",
												selectCardFound.card_images?.[0]?.image_url_cropped ??
													"",
											)
										}
									>
										Save Card
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default SearchForm;
