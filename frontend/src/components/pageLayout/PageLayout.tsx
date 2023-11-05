'use client'
import { PropsWithChildren, ReactElement, useEffect, useState } from 'react';
import { Grid, GridItem } from '@chakra-ui/react';

import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/lib/Theme";

import { useRouter } from 'next/router';
import PongNavBar from '../nav/PongNavBar';

export default function PageLayout({ children }: { children: ReactElement }) {
	return (
		<ChakraProvider theme={theme}>
			<Grid
				h='100px'
				gap='0'
				templateAreas={`"nav"
							"content"`}
				gridTemplateRows={'10vh 90vh'}
				templateColumns={'100%'}
			>
				<GridItem area={'nav'} bg='yellow.300'>
					<PongNavBar />
				</GridItem>
				<GridItem area={'content'} bg='pongBlue.400' overflowY='auto'>
					{children}
				</GridItem>
			</Grid>
		</ChakraProvider>
	)
}
