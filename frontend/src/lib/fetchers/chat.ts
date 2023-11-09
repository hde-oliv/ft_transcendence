import pongAxios from "./pongAxios";
import z from "zod";

const channelResponseSchema = z.object({
	id: z.number(),
	type: z.enum(['private', 'public']),
	name: z.string(),
	password: z.string(),
	protected: z.boolean(),
	user2user: z.boolean(),
});

const myChannelsResponseSchema = z.object({
	id: z.number().int(),
	channelId: z.number().int(),
	userId: z.string(),
	owner: z.boolean(),
	administrator: z.boolean(),
	banned: z.boolean(),
	muted: z.boolean(),
	channel: channelResponseSchema.omit({ password: true, })
})

const relationSchema = myChannelsResponseSchema.omit({
	channel: true,
	id: true,
	channelId: true
});

const myChannelsSchema = channelResponseSchema
	.omit({ password: true })
	.merge(z.object({ relation: relationSchema }))

export type channelResponse = z.infer<typeof channelResponseSchema>;
export type myChannelResponse = z.infer<typeof myChannelsResponseSchema>;
export type myChannel = z.infer<typeof myChannelsSchema>;

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

export async function fetchMyChannels() {
	const token = localStorage.getItem("token");
	if (token === null) throw new Error(`getMe could't get bearer token`);
	const fetcher = pongAxios(token);

	try {
		const response = await fetcher.get(`chat/mychannels`);
		const parsedData = z.array(myChannelsResponseSchema).parse(response.data);
		const arr = parsedData.map(e => {
			const channelData = channelResponseSchema.omit({ password: true }).parse(e.channel);
			const relation = relationSchema.parse(e);
			const returnVal = {
				...channelData,
				relation: relation
			}
			return returnVal;
		});
		// const final = myChannelsSchema.parse(arr[0]);
		const final = z.array(myChannelsSchema).parse(arr)
		return final;
	} catch (e) {
		console.warn(e);
		return [];
	}
}
