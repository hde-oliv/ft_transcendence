'use client'
import { Html, Head, Main, NextScript } from "next/document";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/lib/Theme";

export default function Document() {
	return (
		<Html lang="en">
			<Head />
			<body>
				{/* <body style={{ display: 'flex' }}> */}
				<ColorModeScript initialColorMode={theme.config.initialColorMode} />
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
