import { pongAxios } from "./pongAxios";
import z from "zod";
import { parse } from "querystring";

export async function inviteToPlay(target_id: string) {
    const fetcher = pongAxios();
    return fetcher.post(`/match/invite/${target_id}`);
  }