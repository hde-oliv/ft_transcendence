import axios from 'axios'
import z, { ZodError } from 'zod'


const twoFactorResponse = z.object({
	intra_login: z.string(),
	otp_auth_url: z.string(),
	otp_base32: z.string()
})

type twoFactorResponse = z.infer<typeof twoFactorResponse>;

export default async function getTwoFacQR() {
	const remote_host = 'http://localhost:3000'; //TODO point to variable with actual address:port
	const fetcher = axios.create({
		baseURL: remote_host,
		headers: {
			Accept: 'Application/json',
			Authorization: localStorage.getItem('token')
		}
	})
	try {
		const response = await fetcher.post('auth/otp/generate');
		const parsedData = twoFactorResponse.parse(response.data)
		return parsedData.otp_auth_url;
	} catch (e) {
		if (e instanceof ZodError) {
			console.warn(`Response of ${remote_host}/auth/otp/generate did not meet expected value`);
			e.errors.forEach(f => console.error(f))
		} else {
			console.error(`Response of ${remote_host}/auth/otp/generate failed`);
		}
		return ''
	}
}