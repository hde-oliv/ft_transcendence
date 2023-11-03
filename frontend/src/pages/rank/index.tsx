import PageLayout from "@/components/pageLayout/PageLayout";
import { ReactElement } from "react";

export default function Rank() {
	return (
		<>
			Ranks Page
		</>
	)
}

Rank.getLayout = function getLayoutPage(page: ReactElement) {
	return (
		<PageLayout>
			{page}
		</PageLayout>
	)
}