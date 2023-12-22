import axios from "axios";
import z, { ZodError } from "zod";
import { pongAxios } from "./pongAxios";

export async function joinQueue() {
  const fetcher = pongAxios();
  const response = await fetcher.post("match/joinQueue");
  return response.data;
}

export async function leaveQueue() {
  const fetcher = pongAxios();
  const response = await fetcher.delete("match/leaveQueue")
  if (response.status === 200)
    return true;
  return false;
}

export async function acceptMatch() {
  const fetcher = pongAxios();
  const response = await fetcher.patch("match/accept")
  if (response.status === 200)
    return true;
  return false;
}

export async function acceptP2P(inviteId: string) {
  const fetcher = pongAxios();
  const response = await fetcher.post(`match/P2P/${inviteId}`)
  if (response.status === 200)
    return true;
  return false;
}
