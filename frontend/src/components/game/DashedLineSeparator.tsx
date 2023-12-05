import { Box } from "@chakra-ui/react";

export default function DashedLineSeparator() {
	return (
		<Box
			position={'absolute'}
			left='50%'
			top='0'
			bottom='0'
			borderLeft='3px dashed white'
		></Box>
	);
}
