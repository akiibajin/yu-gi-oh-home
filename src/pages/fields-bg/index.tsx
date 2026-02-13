import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PLAYERS_NAMES } from "@/lib/constants";
import normalizeCard from "@/lib/normalize-card";
import { getCardsByUserId } from "@/lib/tauri/get-cards-by-user-id";
import type { YugiohBackground, YugiohCardWithImgUrl } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useEffect, useState } from "preact/hooks";
import SearchForm from "./component/search-form";
import { toast } from "react-toastify";
import {
	getCurrentBackground,
	setCurrentBackground,
} from "@/lib/tauri/background";
import { assignYugiohCardToUser } from "@/lib/tauri/store-card";

function FieldsBgPage() {
	const [currentUser, setCurrentUser] = useState<string>("");
	const [isLoadingCardsUser, setIsLoadingCardsUser] = useState(false);
	const [currentBackground, setCurrentBackgroundState] =
		useState<YugiohBackground | null>(null);
	const [userCards, setUserCards] = useState<YugiohCardWithImgUrl[]>([]);
	const [tab, setTab] = useState<"find" | "create">("find");
	const [selectedCard, setSelectedCard] = useState<null | YugiohCardWithImgUrl>(
		null,
	);
	const notify = (message: string) => toast(message);
	const handleSaveCard = async (
		cardId: number,
		cardName: string,
		imgUrl: string,
	) => {
		if (!currentUser) {
			notify("Select a user first");
			return;
		}
		const isNewCard = !userCards.some((card) => card.id === `${cardId}`);
		await setCurrentBackground({ name: cardName, imgUrl });
		notify(`Background set to card ${cardName} for user ${currentUser}`);
		if (isNewCard) {
			await assignYugiohCardToUser({
				cardId: `${cardId}`,
				userName: currentUser,
			});
		}
	};

	useEffect(() => {
		if (!currentUser) {
			return;
		}
		const handleChangeUserId = async () => {
			try {
				setIsLoadingCardsUser(true);
				const cards = await getCardsByUserId(currentUser);
				const normalizedCards = cards.map(normalizeCard);
				const fieldsCards = normalizedCards.filter(
					(card) => card.cardType === "Field",
				);
				setUserCards(fieldsCards);
			} finally {
				setIsLoadingCardsUser(false);
			}
		};
		handleChangeUserId();
	}, [currentUser]);
	useEffect(() => {
		const init = async () => {
			const res = await getCurrentBackground();
			if (res) {
				setCurrentBackgroundState(res);
			}
		};
		init();
	}, []);
	return (
		<div className="flex-1 flex flex-col size-full">
			<Card>
				<CardContent>
					<CardHeader>
						<CardTitle>Fields BG Page</CardTitle>
					</CardHeader>
					<CardDescription>
						Find cards selecting the user, you can set, create cards associated
						to that user and then set background from those
					</CardDescription>
					{currentBackground && (
						<div className="mb-4">
							<h3>Current Background</h3>
							<img
								src={currentBackground.img_url}
								alt={currentBackground.name}
								className="w-full max-w-10 h-auto rounded shadow"
							/>
						</div>
					)}
					<div className="flex flex-col gap-2 mt-4 w-full">
						<label htmlFor="user-select" className="block font-medium">
							<span>User ID: *</span>
						</label>
						<Select value={currentUser} onValueChange={setCurrentUser}>
							<SelectTrigger
								id="user-select"
								enabled={!isLoadingCardsUser}
								className="w-full sm:w-64"
							>
								<SelectValue placeholder="Select a user" />
							</SelectTrigger>
							<SelectContent>
								{PLAYERS_NAMES.map((user) => (
									<SelectItem key={user} value={user.toLowerCase()}>
										{user}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{isLoadingCardsUser && (
							<Loader className="animate-spin mx-auto mt-4" />
						)}
						{userCards.length > 0 && (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
								{userCards.map((card) => (
									<Button
										variant={selectedCard?.id === card.id ? "default" : "ghost"}
										key={card.id}
										className="h-fit! flex-col"
										onClick={() => setSelectedCard(card)}
									>
										<img
											key={card.id}
											src={card.imgUrl}
											alt={card.name || "Yugioh Card"}
											className="w-full max-w-15 h-auto rounded shadow"
										/>
										<span className="max-w-15 truncate">{card.name}</span>
									</Button>
								))}
							</div>
						)}
						<Button
							disabled={!selectedCard}
							onClick={() =>
								handleSaveCard(
									+(selectedCard?.id ?? 0),
									selectedCard?.name ?? "",
									selectedCard?.imgUrl ?? "",
								)
							}
						>
							Set Background from Selected Card
						</Button>
					</div>
				</CardContent>
			</Card>
			<Card className="mt-4">
				<CardContent>
					<CardHeader>
						<CardTitle>Create or edit Card</CardTitle>
					</CardHeader>
					<CardDescription>
						Here you can create or edit a card for the selected user
					</CardDescription>
					<div className="inline-flex w-fit items-center rounded-md border p-1 mb-4">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className={cn(
								"rounded-sm",
								tab === "find" && "bg-accent text-accent-foreground",
							)}
							onClick={() => setTab("find")}
						>
							Card maker
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className={cn(
								"rounded-sm",
								tab === "create" && "bg-accent text-accent-foreground",
							)}
							onClick={() => setTab("create")}
						>
							Import deck
						</Button>
					</div>
					{tab === "find" ? (
						<SearchForm user={currentUser} handleSaveCard={handleSaveCard} />
					) : (
						<div>Deck Importer Form Placeholder</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default FieldsBgPage;
