import axios from 'axios'

export const steps = [
	{ title: 'Load QRcode', description: 'Point your camera at the QRcode' },
	{ title: 'Confirmation', description: 'Insert the code generated in your phone' }
]
export default async function verifyOTP(token: string) {
	const remote_host = 'http://localhost:3000'; //TODO point to variable with actual address:port
	const fetcher = axios.create({
		baseURL: remote_host,
		headers: {
			Accept: 'Application/json',
			Authorization: localStorage.getItem('bearerPong42')
		}
	})
	try {
		const response = await fetcher.post('auth/otp/verify', { token: token });
		if (response.status === 201)
			return true;
	} catch (e) {
		return false
	}
}