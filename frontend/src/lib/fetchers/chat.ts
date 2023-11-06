import pongAxios from "./pongAxios";
import z from "zod";

const channelResponseSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  password: z.string(),
  protected: z.boolean(),
  user2user: z.boolean(),
});

export type channelResponse = z.infer<typeof channelResponseSchema>;

export async function fetchDirectChannelByUsers(
  requester: string,
  second_user: string
) {
  const token = localStorage.getItem("token");
  if (token === null) throw new Error(`getMe could't get bearer token`);
  const fetcher = pongAxios(token);

  try {
    const response = await fetcher.post("chat/channel/direct", {
      user1: requester,
      user2: second_user,
    });
    console.warn(response.status);
    return channelResponseSchema.parse(response.data);
  } catch (error) {
    console.warn(error);
    return await createChannel(requester, second_user);
  }
}

export async function createChannel(requester: string, second_user: string) {
  const token = localStorage.getItem("token");
  if (token === null) throw new Error(`getMe could't get bearer token`);
  const fetcher = pongAxios(token);
  const response = await fetcher.post("chat/channel", {
    name: `${requester} & ${second_user}`,
    type: "private",
    password: "",
    protected: false,
    user2user: true,
    members: [second_user],
  });
  return channelResponseSchema.parse(response.data);
}

export async function fetchMessagesFromChannel(channelId: number) {
  const token = localStorage.getItem("token");
  if (token === null) throw new Error(`getMe could't get bearer token`);
  const fetcher = pongAxios(token);

  try {
    const response = await fetcher.get(`chat/channel/${channelId}/messages`);
    return response.data;
  } catch (e) {
    console.warn(e);
    return [];
  }
}
