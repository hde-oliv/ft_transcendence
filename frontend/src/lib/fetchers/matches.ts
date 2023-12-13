import axios from "axios";
import z, { ZodError } from "zod";
import { pongAxios } from "./pongAxios";

export async function joinQueue() {
  const fetcher = pongAxios();
  const response = await fetcher.post("match/joinQueue");
  return response.data;
}
