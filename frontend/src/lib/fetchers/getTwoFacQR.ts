import axios from 'axios'
import z, { ZodError } from 'zod'
import pongAxios from './pongAxios';


const twoFactorResponse = z.object({
	intra_login: z.string(),
	otp_auth_url: z.string(),
	otp_base32: z.string()
})

type twoFactorResponse = z.infer<typeof twoFactorResponse>;

export default async function getTwoFacQR() {
	const token = localStorage.getItem('token');
	if (token === null)
		return '';
	const fetcher = pongAxios(token)
	try {
		const response = await fetcher.post('auth/otp/generate');
		const parsedData = twoFactorResponse.parse(response.data)
		return parsedData.otp_auth_url;
	} catch (e) {
		if (e instanceof ZodError) {
			console.warn(`Response of /auth/otp/generate did not meet expected value`);
			e.errors.forEach(f => console.error(f))
		} else {
			console.error(`Response of /auth/otp/generate failed`);
		}
		return ''
	}
}