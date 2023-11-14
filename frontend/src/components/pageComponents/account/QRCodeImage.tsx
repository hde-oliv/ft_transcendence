'use client';
import { Spinner } from "@chakra-ui/react";
import { Image } from '@chakra-ui/react';



export const QRCodeImage: React.FC<{ src: string; 'aria-label': string; }> = (props) => {
	if (props.src) {
		return <Image src={`${props.src}`} aria-label={props["aria-label"]} />;
	}
	return <Spinner size='xl' color='yellow' />;
};
