import pongAxios from "./pongAxios";
import z from 'zod';

const meResponseData = z.object({
	nickname: z.string(),
	avatar: z.string(),
	intra_login: z.string(),
	online: z.boolean(),
	otp_enabled: z.boolean()
})

type UpdateUserDto = {
	intra_login: string;
	nickname?: string | undefined;
	avatar?: string | undefined;
}

export type MeResponseData = z.infer<typeof meResponseData>;

export async function getMe() {
	const token = localStorage.getItem('token')
	if (token === null)
		throw new Error(`getMe could't get bearer token`);
	const fetcher = pongAxios(token)
	const response = await fetcher.get('me');
	return meResponseData.parse(response.data);
}

export async function updateMe(params: UpdateUserDto) {
	const token = localStorage.getItem('token')
	if (token === null)
		throw new Error(`getMe could't get bearer token`);
	const fetcher = pongAxios(token)
	const response = await fetcher.post('me', params);
	if (response.status !== 201) {
		console.log(response);
		return false;
	} else {
		return true;
	}

}