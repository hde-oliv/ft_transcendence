import { pongAxios } from "./pongAxios";
import z from "zod";
import * as BodyParser from 'body-parser';
import { parse } from "querystring";

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
	const fetcher = pongAxios();
	const response = await fetcher.get(`user/${id}`);
	return response.data;
}

