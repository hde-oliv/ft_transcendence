import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getToken } from "../TokenMagagment";

// export const baseUrl = "https://transcendence.ngrok.io/api";
export const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export const wsBaseUrl = baseUrl.replace("/api", "");

/**
 * @description
 * @returns Instace of Axios, with baseUrl to application
 */
export function pongAxios(): AxiosInstance {
	let localToken = getToken()
	const config: AxiosRequestConfig = {
		baseURL: baseUrl,
		headers: {
			Accept: "Application/json",
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	};

	if (localToken && config.headers)
		config.headers.Authorization = `Bearer ${localToken}`;
	return axios.create(config);
}
