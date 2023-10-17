import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { Readex_Pro, Work_Sans } from "next/font/google";

const baseFont = Work_Sans({ weight: ["300", "400"], subsets: ["latin"] });
const headingFont = Readex_Pro({ weight: "500", subsets: ["latin"] });

const config: ThemeConfig = {
	initialColorMode: "light",
	useSystemColorMode: false,
};

const theme = extendTheme({
	config,
	colors: {
		pongBlue: {
			50: '#030254',
			100: '#030254',
			200: '#030254',
			300: '#030254',
			400: '#030254',
			500: '#030254',
			600: '#030254',
			700: '#030254',
			800: '#030254',
			900: '#030254'
		}
	},
	fonts: {
		heading: headingFont.style.fontFamily,
		body: baseFont.style.fontFamily,
	},
	components: {
		Button: {
			baseStyle: {
				fontFamily: "heading",
				fontWeight: "medium",
			},
		},
	}
});

export default theme;
