import {
	Flex,
	Container,
	Stack,
	Text,
	Image,
	Progress,
	useToast,
} from "@chakra-ui/react";
import { Toast } from "@chakra-ui/react";
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { z, ZodError } from "zod";
import { sendSsoCode } from "@/lib/fetchers/sendSsoCode";
import { storeToken } from "@/lib/TokenMagagment";

const tokenPayload = z.object({
	nickname: z.string().min(1, "User Nickname cannot be empty"),
	avatar: z.string({ required_error: "An avatar must be provided" }),
	intra_login: z.string().min(1, "42 Intranet login cannot be empty"),
	otp_enabled: z.boolean(),
	otp_verified: z.boolean(),
	iat: z
		.number()
		.int()
		.transform((n) => new Date(n * 1000)),
	exp: z
		.number()
		.int()
		.transform((n) => new Date(n * 1000)),
});
type tokenPayloadType = z.infer<typeof tokenPayload>;

const loginResponse = z.object({
	access_token: z.string(),
});

export default function Login() {
	const router = useRouter();
	const toast = useToast();

	useEffect(() => {
		//TODO: add redirection for twofa when needed
		async function sendCode() {
			if (typeof router.query.code === "string") {
				return sendSsoCode(router.query.code);
			}
			throw new Error("No code was sent by client");
		}
		if (router.query.code) {
			(async () => {
				let localToken: string = "";
				const totalTime = 2000;
				try {

					localToken = await sendCode();
					const bearerRegex = /(^[\w-]*\.[\w-]*\.[\w-]*$)/g;
					if (bearerRegex.test(localToken)) {
						storeToken(localToken, localStorage);
						const redirector = setTimeout(() => {
							router.push("/dashboard");
						}, totalTime);
						toast({
							title: "Login Succeeded",
							description: "Redirecting to dashboard",
							status: "success",
							isClosable: true,
							duration: totalTime - 1000,
							onCloseComplete: () => {
								clearTimeout(redirector);
								router.push("/dashboard");
							},
						});
					} else {
						localStorage.setItem("username", localToken);
						const redirector = setTimeout(() => {
							router.push("/");
						}, totalTime);
						toast({
							title: "Login Succeeded",
							description: "Redirecting to 2FA login",
							status: "info",
							isClosable: true,
							duration: totalTime - 1000,
							onCloseComplete: () => {
								clearTimeout(redirector);
								router.push("/twofa");
							},
						});
					}
				} catch (e) {
					const redirector = setTimeout(() => {
						router.push("/");
					}, totalTime);
					toast({
						title: "Login Failed",
						description: "Redirecting to home",
						status: "error",
						isClosable: true,
						duration: totalTime - 1000,
						onCloseComplete: () => {
							clearTimeout(redirector);
							router.push("/");
						},
					});
				}
			})();
		}
	}, [router.query.code, router, toast]);
	return (
		<Flex dir="column" justify="center" align="center" h="100vh" bg="#030254">
			<Container>
				<Flex justify="center" mb="20vh">
					<Image src="logopong_login.png" alt="pong logo" />
				</Flex>
				<Stack>
					<Progress isIndeterminate />
				</Stack>
			</Container>
		</Flex>
	);
}
