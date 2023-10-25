'use client'
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/lib/Theme";
import type { ReactElement, ReactNode } from 'react'
import type { AppProps } from "next/app";
import type { NextPage } from 'next'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode
}
type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout
}
export default function App({ Component, pageProps }: AppPropsWithLayout) {
	const getLayout = Component.getLayout ?? ((page) => (<ChakraProvider theme={theme}>{page}</ChakraProvider>));

	return getLayout(<Component {...pageProps} />)

	return getLayout(
		<ChakraProvider theme={theme}>
			<Component {...pageProps} />
		</ChakraProvider>
	)
}
