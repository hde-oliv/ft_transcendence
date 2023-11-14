import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * @description
 * @param token string
 * @returns Instace of Axios, with baseUrl defined and Authorization IF token if provided
 */
// export const baseUrl = "https://transcendence.ngrok.io/api";
export const baseUrl = "http://localhost:3000";

export function pongAxios(token?: string): AxiosInstance {
	const config: AxiosRequestConfig = {
		baseURL: baseUrl,
		headers: {
			Accept: "Application/json",
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	};

	if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
	return axios.create(config);
}
