import PageLayout from "@/components/pageLayout/PageLayout";
import { ReactElement } from "react";

export default function Games() {
	return (
		<>
			Games page
		</>
	)
}

Games.getLayout = function getLayoutPage(page: ReactElement) {
	return (
		<PageLayout>
			{page}
		</PageLayout>
	)
}