'use client'
import { Button, Container, Input, Stack } from "@chakra-ui/react";
import useSWR from 'swr';
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


// async function postAuth(url: string) {
// 	try {
// 		axios.post('', {
// 			"grant_type": "client_credentials",
// 			"client_id": "u-s4t2ud-3de5cf4457b1f80620c18837e62b7ffb649ab8da9396415f8aba8688170eddb6",
// 			"client_secret": "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"
// 		})
// 	} catch (e) {

// 	}
// }

export default function Home() {
	const [token, setToken] = useState(undefined);

	const router = useRouter();
	function logIn42_redirect() {
		const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3de5cf4457b1f80620c18837e62b7ffb649ab8da9396415f8aba8688170eddb6&redirect_uri=http%3A%2F%2FLocalhost%3A3001&response_type=code`;
		window.location.href = authURL;

	}
	async function exchangeCode() {
		try {
			const code = router.query.code;
			if (!code) {
				window.alert('No code available');
				return;
			}
			const response = await axios.post('https://api.intra.42.fr/oauth/token', {
				"grant_type": "client_credentials",
				"client_id": "u-s4t2ud-3de5cf4457b1f80620c18837e62b7ffb649ab8da9396415f8aba8688170eddb6",
				"client_secret": "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",
				"code": code,
				"redirect_uri": "http://localhost:3001/"
			})

		} catch (e) {
			window.alert(e.message)
		}
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
			<Container>
				<Stack>
					<Input placeholder='UID'></Input>
					<Input placeholder='SECRET'></Input>
					<Button onClick={logIn42_redirect}>LogIn 42</Button>
					<Button onClick={exchangeCode} isDisabled={router.query.code === undefined}>Send</Button>
				</Stack>
			</Container>
		</div>
	);
}
