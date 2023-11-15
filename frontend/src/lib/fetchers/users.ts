import { pongAxios } from "./pongAxios";
import z from "zod";

export const returnUserSchema = z.object({
	nickname: z.string(),
	avatar: z.string(),
	intra_login: z.string(),
	status: z.string(),
	elo: z.number(),
});

export type ReturnUserSchema = z.infer<typeof returnUserSchema>;

export async function fetchUsers(): Promise<Array<ReturnUserSchema>> {
	const fetcher = pongAxios();
	const response = await fetcher.get("user");
	return z.array(returnUserSchema).parse(response.data);
}

export async function fetchUserById(id: string) {
	const token = localStorage.getItem("token");
	if (token === null) throw new Error(`getMe could't get bearer token`);
	const fetcher = pongAxios(token);
	const response = await fetcher.get(`user/${id}`);
	return response.data;
}
