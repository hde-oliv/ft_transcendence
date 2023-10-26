import pongAxios from "./pongAxios";
import z from 'zod';

const meResponseData = z.object({
	nickname: z.string(),
	avatar: z.string(),
	intra_login: z.string(),
	online: z.boolean(),
	otp_enabled: z.boolean()
})

export type MeResponseData = z.infer<typeof meResponseData>;

export default async function getMe() {
	const token = localStorage.getItem('token')
	if (token === null)
		throw new Error(`getMe could't get bearer token`);
	const fetcher = pongAxios(token)
	const response = await fetcher.get('me');
	return meResponseData.parse(response.data);
}