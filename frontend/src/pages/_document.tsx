'use client'
import { Html, Head, Main, NextScript } from "next/document";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/lib/Theme";

function ScrollHider() {
	return (
		<style>
			{`
								/* Hide the scrollbar but keep the ability to scroll */
								::-webkit-scrollbar {
									width: 0 !important;
								}

								/* Optional: Style the track and handle for a better visual appearance */
								::-webkit-scrollbar-track {
									background: transparent;
								}

								::-webkit-scrollbar-thumb {
									background: #888;
									border-radius: 8px;
								}
								`}
		</style>
	)
}
export default function Document() {
	return (
		<Html lang="en">
			<Head />
			<ScrollHider />
			<body>
				<ColorModeScript initialColorMode={theme.config.initialColorMode} />
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
