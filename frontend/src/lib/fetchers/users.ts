import { pongAxios } from "./pongAxios";
import z from "zod";

// TODO: Validation
// const userResponse = z.object({
//   nickname: z.string(),
//   avatar: z.string(),
//   intra_login: z.string(),
//   status: z.string(),
//   elo: z.number(),
// });

export async function fetchUsers() {
  const token = localStorage.getItem("token");
  if (token === null) throw new Error(`getMe could't get bearer token`);
  const fetcher = pongAxios(token);
  const response = await fetcher.get("user");
  return response.data;
}

export async function fetchUserById(id: string) {
  const token = localStorage.getItem("token");
  if (token === null) throw new Error(`getMe could't get bearer token`);
  const fetcher = pongAxios(token);
  const response = await fetcher.get(`user/${id}`);
  return response.data;
}
