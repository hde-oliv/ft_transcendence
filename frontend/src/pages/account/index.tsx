import PageLayout from "@/components/pageLayout/PageLayout";
import { EditIcon } from "@chakra-ui/icons";
import { Box, Button, Card, CardBody, CardHeader, Center, Flex, Heading, IconButton, Stack, StackDivider, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function Games() {
	const [userData, setUserData] = useState({
		forthyTwoTag: 'hde-camp',
		avatar: '',
		nickname: 'Badger',
		otpEnabled: false
	})
	return (
		<PageLayout>
			<Center pt='2vh'>
				<Flex flexDir='column'>
					<Card bg='pongBlue.500'>
						<CardHeader w='80vw'>
							<Heading textAlign='center'>Account details</Heading>
						</CardHeader>
						<CardBody>
							<Stack divider={<StackDivider />}>
								<Box>
									<Heading pl='1vw' size='sm' >Your Intra Tag </Heading>
									<Text pl='2vw' >{userData.forthyTwoTag}</Text>
								</Box>
								<Flex justifyContent='space-between'>
									<Box>
										<Heading pl='1vw' size='sm' >Your Intra Tag </Heading>
										<Text pl='2vw' >{userData.forthyTwoTag}</Text>
									</Box>
									<IconButton colorScheme="yellow" aria-label="edit" icon={<EditIcon />} />
								</Flex>
								<Box>
									<Heading pl='1vw' size='sm' >Two factor </Heading>
									<Text pl='2vw' >{userData.forthyTwoTag}</Text>
								</Box>
							</Stack>
						</CardBody>
					</Card>
				</Flex>
			</Center>
		</PageLayout>
	)
}