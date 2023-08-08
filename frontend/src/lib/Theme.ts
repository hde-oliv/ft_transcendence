import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { Readex_Pro, Work_Sans } from "next/font/google";

const baseFont = Work_Sans({ weight: ["300", "400"], subsets: ["latin"] });
const headingFont = Readex_Pro({ weight: "500", subsets: ["latin"] });

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
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
  },
});

export default theme;
