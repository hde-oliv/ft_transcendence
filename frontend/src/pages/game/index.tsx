import PageLayout from "@/components/pageLayout/PageLayout";
import { ReactElement } from "react";

export default function Game() {
	return (
		<>
			Game Page
		</>
	)
}

Game.getLayout = function getLayoutPage(page: ReactElement) {
	return (
		<PageLayout>
			{page}
		</PageLayout>
	)
}