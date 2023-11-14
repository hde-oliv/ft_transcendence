import { pongAxios } from "./pongAxios";

export async function getAllFriends() {
	const fetcher = pongAxios();

	const response = await fetcher.get('/friend')
	return response.data;
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