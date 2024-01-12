import axios from "axios";
import z, { ZodError } from "zod";
import { pongAxios } from "./pongAxios";

const historyRecord = z.object({
  id: z.string().uuid(),
  target: z.object({
    id: z.string(),
    nickname: z.string(),
    score: z.number().int(),
  }),
  adversary: z.object({
    id: z.string(),
    nickname: z.string(),
    score: z.number().int(),
  }),
  start: z.coerce.date(),
  status: z.enum(["paused", "running", "finished", "aborted"]),
});
export type HistoryRecord = z.infer<typeof historyRecord>;

const rankResponse = z.object({
  rank: z.number(),
  elo: z.number(),
  variation: z.number()
})

export type Rank = z.infer<typeof rankResponse>;

const statsResponse = z.object({
  win: z.number().int(),
  loss: z.number().int(),
  tie: z.number().int(),
  indeterminate: z.number().int(),
});

export type UserStats = z.infer<typeof statsResponse>;

export async function joinQueue() {
  const fetcher = pongAxios();
  const response = await fetcher.post("match/joinQueue");
  return response.data;
}

export async function leaveQueue() {
  const fetcher = pongAxios();
  const response = await fetcher.delete("match/leaveQueue");
  if (response.status === 200) return true;
  return false;
}

export async function acceptMatch() {
  const fetcher = pongAxios();
  const response = await fetcher.patch("match/accept");
  if (response.status === 200) return true;
  return false;
}

export async function acceptP2P(inviteId: string) {
  const fetcher = pongAxios();
  const response = await fetcher.post(`match/P2P/${inviteId}`);
  if (response.status === 200) return true;
  return false;
}

export async function userHistory(userId: string) {
  const fetcher = pongAxios();
  const response = await fetcher.get(`match/history/${userId}`);
  const parsedResponse = z.array(historyRecord).parse(response.data);
  return parsedResponse;
}

export async function myHistory() {
  const fetcher = pongAxios();
  const response = await fetcher.get(`match/history`);
  const parsedResponse = z.array(historyRecord).parse(response.data);
  return parsedResponse;
}

export async function myStats() {
  const fetcher = pongAxios();
  const response = await fetcher.get(`match/myStats`);
  const parsedResponse = statsResponse.parse(response.data);
  return parsedResponse;
}

export async function getUserStats(userId: string) {
  const fetcher = pongAxios();
  const response = await fetcher.get(`match/stats/${userId}`);
  const parsedResponse = statsResponse.parse(response.data);
  return parsedResponse;
}

export async function myRank() {
  const fetcher = pongAxios();
  const response = await fetcher.get(`match/myRank`);
  const parsedResponse = rankResponse.parse(response.data);
  return parsedResponse;
}

export async function getUserRank(userId: string) {
  const fetcher = pongAxios();
  const response = await fetcher.get(`match/rank/${userId}`);
  const parsedResponse = rankResponse.parse(response.data);
  return parsedResponse;
}
