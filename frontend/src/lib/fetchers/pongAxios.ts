import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getToken } from "../TokenMagagment";


/**
 * @description
 * @param token string
 * @returns Instace of Axios, with baseUrl defined and Authorization IF token if provided
 */
// export const baseUrl = "https://transcendence.ngrok.io/api";

export const baseUrl = "http://localhost:3000";
export const wsBaseUrl = baseUrl.replace('/api', '');

export function pongAxios(token?: string): AxiosInstance {
	let localToken = token;
	if (!token) {
		localToken = getToken();
	} //TODO, all calls to pongAxios dont need to provide a token anymore, also, this function will throw if no token is available
	const config: AxiosRequestConfig = {
		baseURL: baseUrl,
		headers: {
			Accept: "Application/json",
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	};

	if (localToken && config.headers) config.headers.Authorization = `Bearer ${localToken}`;
	return axios.create(config);
}
