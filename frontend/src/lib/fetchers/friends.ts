import { pongAxios } from "./pongAxios";
import z from 'zod'
import { ReturnUserSchema, returnUserSchema } from "./users";

export async function getAllFriends(): Promise<Array<ReturnUserSchema>> {
	const fetcher = pongAxios();

	const response = await fetcher.get('/friend')
	return z.array(returnUserSchema).parse(response.data);
}
export async function getFriendsById(id: string) {
	const fetcher = pongAxios();

	const response = await fetcher.get(`/friend/${id}`)
	return response.data;
}
export async function getFriendsByUser(id: string) {
	const fetcher = pongAxios();

	const response = await fetcher.get(`/friend/user/${id}`)
	return response.data;
}
export async function createFriendship(data: { fOne: string, fTwo: string }) {
	const fetcher = pongAxios();

	const response = await fetcher.post(`/friend`, data);
	return response.data;
}