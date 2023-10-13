import { PropsWithChildren } from 'react';
import PongPageMenu from '../../components/nav/PongNavBar'
import { Heading } from '@chakra-ui/react';
import { Grid, GridItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function Dashboard(props: PropsWithChildren) {
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
				<PongPageMenu />
			</GridItem>
			<GridItem area={'content'}>
				<Heading>{router.route}</Heading>
			</GridItem>
		</Grid>
	)
}