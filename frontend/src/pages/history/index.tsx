import PageLayout from "@/components/pageLayout/PageLayout";
import { ReactElement } from "react";

export default function History() {
	return (
		<>
			Account Page
		</>
	)
}

History.getLayout = function getLayoutPage(page: ReactElement) {
	return (
		<PageLayout>
			{page}
		</PageLayout>
	)
}