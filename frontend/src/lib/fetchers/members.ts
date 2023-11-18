import { pongAxios } from "./pongAxios";
import z from "zod";
import { returnUserSchema } from "./users";

export async function getMembers(id: number) {
  const fetcher = pongAxios();
  const response = await fetcher.get(`/channel/${id}/users`);
  return z.array(returnUserSchema).parse(response.data);
}
