import { CardMakerForm } from "@/pages/card-maker/component/card-maker-form";
import { CardPreview } from "@/pages/card-maker/component/card-preview";

function CardMaker() {
	return (
		<div className="flex w-full flex-col gap-4 md:flex-row">
			<div className="w-full md:w-105 md:flex-none">
				<CardPreview />
			</div>
			<div className="min-w-0 flex-1">
				<CardMakerForm />
			</div>
		</div>
	);
}

export default CardMaker;
