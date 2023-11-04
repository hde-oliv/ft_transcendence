import { PropsWithChildren } from "react";
import {
  Flex,
  Container,
  Image,
  Stack,
  Button,
  Heading,
  Highlight,
  Text,
  HStack,
} from "@chakra-ui/react";
import { PinInput, PinInputField } from "@chakra-ui/react";

export default function Dashboard(props: PropsWithChildren) {
  return (
    <Flex dir="column" justify="center" align="center" h="100vh" bg="#030254">
      <Container>
        <Stack>
          <Text color="orange" textAlign="center" fontSize="2xl">
            Scan the QR Code
          </Text>
        </Stack>
      </Container>
    </Flex>
  );
}
