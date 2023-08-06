import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { Barlow_Condensed, Montserrat } from 'next/font/google'

const barlowCondensed = Barlow_Condensed({ weight: '600', subsets: ['latin'] })
const montserrat = Montserrat({ weight: '400', subsets: ['latin'] })

const theme = extendTheme({
    fonts: {
        montserrat: montserrat.style.fontFamily,
        barlow: barlowCondensed.style.fontFamily
    }
})

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider theme={theme}>
            <Component {...pageProps} />
        </ChakraProvider>
    )
}
