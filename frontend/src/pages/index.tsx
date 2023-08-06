import { Badge, Center, Container, Flex, Stack } from '@chakra-ui/react'
import { Divider } from '@chakra-ui/react'
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Avatar,
    AvatarBadge,
    Box,
    Text
} from '@chakra-ui/react'

import { Image } from '@chakra-ui/react'

const resultList = ["Sigmund Freud"]

const baseUser = {
    avatar: "https://s1.static.brasilescola.uol.com.br/be/conteudo/images/sigmund-freud.jpg",
    email: "sigmundfreud@gmail.com",
    firstName: "Sigmund",
    lastName: "Freud",
    status: "on"
}

interface StatusBadgeProps {
    rawStatus: string;
}

const StatusBadge = (props: StatusBadgeProps) => {
    let color: string;
    let status: string;

    if (props.rawStatus === "on") {
        color = "green";
        status = "Online";
    } else if (props.rawStatus === "off") {
        color = "red";
        status = "Offline";
    } else {
        color = "yellow";
        status = "AFK";
    }

    return (
        <Badge colorScheme={color}>{status}</Badge>
    )
}

export default function Home() {
    return (
        <Box bg="gray.50">
            <Container maxW="container.xl" height="100vh">
                <Flex height="100%" >
                    <Flex p="10" pl="0" flex="1">
                        <Flex width="100%" mt="10" mb="10" flexDirection="column" bg="whiteAlpha.700" borderRadius="xl" rounded="xl" boxShadow="lg" p="10" >
                            <Input />
                            <Flex flexDirection="column" mt="2" >
                                {
                                    resultList.map((value, index) => {
                                        return (
                                            <>
                                                <Text p="1" key={index} mt="5" fontSize="sm" fontFamily="montserrat" >{value}</Text>
                                                <Divider />
                                            </>
                                        )
                                    })
                                }
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex width="100%" p="10" pr="0" flex="3">
                        <Flex width="100%" m="10" alignItems="center" flexDirection="column" bg="whiteAlpha.700" borderRadius="xl" rounded="xl" boxShadow="lg" p="10" >
                            <Avatar
                                mt="10"
                                boxSize="280px"
                                borderRadius="full"
                                objectFit="cover"
                                src={baseUser.avatar}
                            />
                            <Stack flexDirection={"row"}>
                                <Text fontFamily="barlow" fontSize="4xl">{baseUser.firstName} {baseUser.lastName}</Text>
                                <Center mt="2">
                                    <StatusBadge rawStatus={baseUser.status} />
                                </Center>
                            </Stack>
                            <Text fontFamily="montserrat">{baseUser.email}</Text>
                            <Divider m="5" />
                        </Flex>
                    </Flex>
                </Flex>
            </Container>
        </Box >
    )
}
