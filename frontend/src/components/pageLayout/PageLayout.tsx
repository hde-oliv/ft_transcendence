'use client'
import { PropsWithChildren } from 'react';
import { Grid, GridItem } from '@chakra-ui/react';

import { useRouter } from 'next/router';
import PongNavBar from '../nav/PongNavBar';


export default function PageLayout(props: PropsWithChildren) {
	const router = useRouter();
	return (
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
				{props.children}
			</GridItem>
		</Grid>
	)
}