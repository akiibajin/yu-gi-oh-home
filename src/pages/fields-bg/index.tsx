import { Button } from "@/components/ui/warcraftcn/button";
import { Badge } from "@/components/ui/warcraftcn/badge";
import { Skeleton } from "@/components/ui/warcraftcn/skeleton";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/warcraftcn/card";
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
import { useEffect, useState } from "preact/hooks";
import SearchForm from "./component/search-form";
import { toast } from "react-toastify";
import {
	getCurrentBackground,
	setCurrentBackground,
} from "@/lib/tauri/background";
import { assignYugiohCardToUser } from "@/lib/tauri/store-card";
import { cn } from "@/lib/utils";

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
		<div className="flex-1 flex flex-col size-full gap-6 p-4 md:p-6">
			<Card>
				<CardContent className="p-6 md:px-12 md:py-10 overflow-y-auto">
					<CardHeader className="px-4 pt-4">
						<div className="flex items-center gap-3 flex-wrap">
							<CardTitle>Fields BG Page</CardTitle>
							{currentUser && (
								<Badge variant="secondary" size="sm">
									{currentUser}
								</Badge>
							)}
							{userCards.length > 0 && (
								<Badge size="sm">{userCards.length} Field Cards</Badge>
							)}
						</div>
					</CardHeader>
					<CardDescription className="px-6">
						Find cards selecting the user, you can set, create cards associated
						to that user and then set background from those
					</CardDescription>
					{currentBackground && (
						<div className="mt-2 mb-2 p-4 bg-black/20 rounded-lg border border-amber-900/30">
							<div className="flex items-center gap-2 mb-3">
								<h3 className="font-semibold text-amber-100 text-lg">
									Current Background
								</h3>
								<Badge variant="default" size="sm">
									Active
								</Badge>
							</div>
							<div className="flex items-center gap-4 flex-col sm:flex-row">
								<img
									src={currentBackground.img_url}
									alt={currentBackground.name}
									className="w-full sm:w-32 h-auto rounded-lg shadow-lg border-2 border-amber-700/50"
								/>
								<span className="text-sm text-amber-200">
									{currentBackground.name}
								</span>
							</div>
						</div>
					)}
					<div className="flex flex-col gap-5 mt-8 w-full">
						<div className="flex items-center gap-2">
							<label
								htmlFor="user-select"
								className="block font-medium text-amber-100"
							>
								<span>User ID:</span>
							</label>
							<Badge variant="destructive" size="sm">
								Required
							</Badge>
						</div>
						<Select value={currentUser} onValueChange={setCurrentUser}>
							<SelectTrigger
								id="user-select"
								enabled={!isLoadingCardsUser}
								className="w-full sm:w-80 md:w-96"
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
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mt-4">
								{[...Array(6)].map((_, i) => (
									<Skeleton key={i} className="w-full h-40" />
								))}
							</div>
						)}
						{userCards.length > 0 && !isLoadingCardsUser && (
							<div className="space-y-5 mt-6">
								<div className="flex items-center gap-2">
									<h4 className="font-semibold text-amber-100">
										Your Field Cards
									</h4>
									{selectedCard && (
										<Badge variant="default" size="sm">
											1 Selected
										</Badge>
									)}
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
									{userCards.map((card) => (
										<div key={card.id} className="relative group">
											<Button
												variant={
													selectedCard?.id !== card.id ? "default" : "frame"
												}
												className={cn(
													"w-full items-center gap-1! flex-col transition-transform hover:scale-105",
													selectedCard?.id === card.id && "py-8!",
												)}
												onClick={() => setSelectedCard(card)}
											>
												<img
													src={card.imgUrl}
													alt={card.name || "Yugioh Card"}
													className="size-25"
												/>
												<span className="text-xs truncate w-full text-center">
													{card.name}
												</span>
											</Button>
											{selectedCard?.id === card.id && (
												<div className="absolute -top-2 -right-2">
													<Badge size="sm" variant="default">
														✓
													</Badge>
												</div>
											)}
										</div>
									))}
								</div>
								<Button
									className="w-full sm:w-auto"
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
						)}
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-6 md:px-12 md:py-10 overflow-y-auto">
					<CardHeader className="px-4 pt-4">
						<CardTitle>Create or edit Card</CardTitle>
					</CardHeader>
					<CardDescription className="px-6">
						Here you can create or edit a card for the selected user
					</CardDescription>
					<div className="flex items-center gap-2 mb-6 mt-6 flex-wrap">
						<Button
							type="button"
							variant={tab === "find" ? "default" : "frame"}
							onClick={() => setTab("find")}
						>
							Card maker
						</Button>
						<Button
							type="button"
							variant={tab === "create" ? "default" : "frame"}
							onClick={() => setTab("create")}
						>
							Import deck
						</Button>
						{tab === "create" && (
							<Badge variant="secondary" size="sm">
								Coming Soon
							</Badge>
						)}
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
