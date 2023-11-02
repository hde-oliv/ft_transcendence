import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

/**
 * @description
 * @param token string
 * @returns Instace of Axios, with baseUrl defined and Authorization IF token if provided
 */
export default function (token?: string): AxiosInstance {

	const config: AxiosRequestConfig = {
		baseURL: 'http://localhost:3000/',
		headers: {
			Accept: 'Application/json',
			"Content-Type": "application/json",
			'Access-Control-Allow-Origin': '*'
		}
	};

	if (token && config.headers)
		config.headers.Authorization = `Bearer ${token}`;
	return axios.create(config);
}