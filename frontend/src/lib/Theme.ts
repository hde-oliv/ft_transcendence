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
			50: '#00000a',
			100: '#000014',
			200: '#010129',
			300: '#02013f',
			400: '#030254',
			500: '#030269',
			600: '#04037e',
			700: '#050393',
			800: '#0604a7',
			900: '#0604bc'
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









