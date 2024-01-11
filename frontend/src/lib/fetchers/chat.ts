import { pongAxios } from "./pongAxios";
import z, { ZodError, boolean } from "zod";

const channelResponseSchema = z.object({
  id: z.number(),
  type: z.enum(["private", "public"]),
  name: z.string(),
  password: z.string(),
  protected: z.boolean(),
  user2user: z.boolean(),
});

const publicChannelResponseSchema = z.object({
  id: z.number(),
  type: z.enum(["private", "public"]),
  name: z.string(),
  protected: z.boolean(),
  user2user: z.boolean(),
});

const joinPublicChannelResponseSchema = z.object({
  channelId: z.number(),
  password: z.string().optional(),
});

const userCheckInChannelResponseSchema = z.boolean();

const blockUserResponseSchema = z.object({
  issuerId: z.string(),
  targetId: z.string(),
});

const blockUserStatusResponseSchema = z.string();

const blockedTargetSchema = z.object({
  nickname: z.string(),
  avatar: z.string(),
  intra_login: z.string(),
  status: z.string(),
  elo: z.number(),
});

const returnAllBlockedUsersSchema = z.object({
  id: z.string(),
  issuer_id: z.string(),
  target_id: z.string(),
  target_user: blockedTargetSchema,
});


export type PublicChannelResponse = z.infer<typeof publicChannelResponseSchema>;
export type JoinPublicChannelResponse = z.infer<typeof joinPublicChannelResponseSchema>;
export type UserCheckInChannelResponse = z.infer<typeof userCheckInChannelResponseSchema>;
export type BlockUserResponse = z.infer<typeof blockUserResponseSchema>;
export type BlockUserStatusResponse = z.infer<typeof blockUserStatusResponseSchema>;
export type ReturnAllBlockedUsersResponse = z.infer<typeof returnAllBlockedUsersSchema>;

const myChannelsResponseSchema = z.object({
  id: z.number().int(),
  channelId: z.number().int(),
  userId: z.string(),
  owner: z.boolean(),
  administrator: z.boolean(),
  banned: z.boolean(),
  muted: z.boolean(),
  channel: channelResponseSchema.omit({ password: true }),
});

const relationSchema = myChannelsResponseSchema.omit({
  channel: true,
  id: true,
  channelId: true,
});

const myChannelsSchema = channelResponseSchema.omit({ password: true }).merge(z.object({ relation: relationSchema }));

export const messageResponseSchema = z.array(
  z.object({
    id: z.string(),
    channel_id: z.number().int(),
    user_id: z.string(),
    message: z.string(),
    time: z.coerce.date(),
    nickname: z.string()
  })
);

const userSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  avatar: z.string(),
  intra_login: z.string(),
  status: z.enum(["offline", "online"]),
  elo: z.number(),
  online: z.boolean(),
});

type user = z.infer<typeof userSchema>;
const myChannelResponse = z.array(
  z.object({
    channelId: z.number().int(),
    userId: z.string(),
    owner: z.boolean(),
    administrator: z.boolean(),
    banned: z.boolean(),
    muted: z.boolean(),
    channel: z.object({
      id: z.number().int(),
      type: z.enum(["private", "public"]),
      name: z.string(),
      protected: z.boolean(),
      user2user: z.boolean(),
      Memberships: z.array(
        z.object({
          id: z.number().int(),
          channelId: z.number().int(),
          userId: z.string(),
          owner: z.boolean(),
          administrator: z.boolean(),
          banned: z.boolean(),
          muted: z.boolean(),
          user: z.object({
            id: z.string(),
            nickname: z.string(),
            avatar: z.string(),
            intra_login: z.string(),
            status: z.enum(["offline", "online"]),
          }),
        })
      ),
    }),
  })
);

const newChannel = z.object({
  type: z.enum(['private', 'public']),
  name: z.string(),
  password: z.string().nullable(),
  protected: z.boolean(),
  user2user: z.boolean(),
  members: z.array(z.string()),
})

const createMembershipSchema = z.object({
  channelId: z.number(),
  userId: z.string(),
  owner: z.boolean().optional(),
  administrator: z.boolean().optional(),
  banned: z.boolean().optional(),
  muted: z.boolean().optional(),
});

const enableChannelPassword = z.object({
  password: z.string(),
  protected: z.literal(true)
})
const disableChannelPassword = z.object({
  protected: z.literal(false)
})
export const updateChannelPassword = z.discriminatedUnion('protected', [enableChannelPassword, disableChannelPassword]);


export const updateChannelData = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
})

export const updateChannelSchema = updateChannelData.or(updateChannelPassword);
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
export const channelData = myChannelResponse.element;

export type FetchChannelUsers = Array<user>;
export type myChannelResponse = z.infer<typeof myChannelsResponseSchema>;
export type channelResponse = z.infer<typeof channelResponseSchema>;
export type MyChannels = z.infer<typeof myChannelResponse>;
export type ChannelData = z.infer<typeof channelData>;
export type myChannel = z.infer<typeof myChannelsSchema>;
export type createChannelParams = z.infer<typeof newChannel>
export type UpdateChannelSchema = Prettify<z.infer<typeof updateChannelSchema>>;
type CreateMembershipSchema = z.infer<typeof createMembershipSchema>;


export async function createChannel(channelData: createChannelParams) {
  const fetcher = pongAxios();
  const response = await fetcher.post("chat/channel", {
    name: channelData.name,
    type: channelData.type,
    password: channelData.password,
    protected: channelData.protected,
    user2user: channelData.user2user,
    members: channelData.members,
  });
  return channelResponseSchema.parse(response.data);
}

export async function fetchMessagesFromChannel(channelId: number) {
  const fetcher = pongAxios();

  try {
    const response = await fetcher.get(`chat/channel/${channelId}/messages`);
    return messageResponseSchema.parse(response.data);
  } catch (e) {
    if (e instanceof ZodError)
      console.warn("Messages schema failed to validade");
    else console.warn(e);
    return [];
  }
}

export async function fetchSingleChannel(channelId: number) {
  const fetcher = pongAxios();
  const response = await fetcher.get(`chat/channel/${channelId}`);
  return channelData.parse(response.data);
}

export async function fetchChannelUsers(
  id: number
): Promise<FetchChannelUsers> {
  const fetcher = pongAxios();
  try {
    const response = await fetcher.get(`chat/channel/${id}/users`);

    return z.array(userSchema).parse(response.data);
  } catch (e) {
    return [];
  }
}

export async function fetchMyChannels(): Promise<MyChannels> {
  const fetcher = pongAxios();
  try {
    const response = await fetcher.get(`chat/mychannels`);

    return myChannelResponse.parse(response.data);
  } catch (e) {
    return [];
  }
}


export async function fetchAllPublicChannels() {
  const fetcher = pongAxios();
  try {
    const response = await fetcher.get(`chat/channel/public`);

    return z.array(publicChannelResponseSchema).parse(response.data);
  } catch (e) {
    return [];
  }
}

export async function joinPublicChannel(data: JoinPublicChannelResponse) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/channel/user/join`, data);
}

export async function fetchUserCheckInChannel(channelId: number) {
  const fetcher = pongAxios();
  const response = await fetcher.get(`chat/channel/user/${channelId}`);
  return userCheckInChannelResponseSchema.parse(response.data);
}


export async function inviteUserToChannel(data: CreateMembershipSchema) {
  const fetcher = pongAxios();
  return fetcher.post('/chat/channel/user/invite', data);
}
export async function patchChannel(channelId: number, data: UpdateChannelSchema): Promise<any> {
  const fetcher = pongAxios();
  return fetcher.patch(`/chat/channel/${channelId}`, data);
}
export async function kickFromChannel(channelId: number, userId: string) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/channel/user/kick`, { channelId: channelId, userId: userId })
}
export async function banFromChannel(channelId: number, userId: string) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/channel/user/ban`, { channelId: channelId, userId: userId })
}
export async function unbanFromChannel(channelId: number, userId: string) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/channel/user/unban`, { channelId: channelId, userId: userId })
}
export async function muteInChannel(channelId: number, userId: string) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/channel/user/mute`, { channelId: channelId, userId: userId })
}
export async function unmuteInChannel(channelId: number, userId: string) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/channel/user/unmute`, { channelId: channelId, userId: userId })
}
export async function promoteChannelAdmin(channelId: number, userId: string) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/channel/user/admin`, { channelId: channelId, userId: userId })
}
export async function demoteChannelAdmin(channelId: number, userId: string) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/channel/user/unadmin`, { channelId: channelId, userId: userId })
}

export async function blockUser(data: BlockUserResponse) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/block`, data);
}

export async function unblockUser(target_id: string) {
  const fetcher = pongAxios();
  return fetcher.post(`/chat/unblock`, { target_id });
}

// export async function fetchblockUserStatus(targetId: string) {
//   const fetcher = pongAxios();
//   const response = await fetcher.get(`chat/block/user/${targetId}`);
//   const blockStatus = blockUserStatusResponseSchema.safeParse(response.data);

//   if (blockStatus.success) {
//     return false;
//   } else {
//     return true;
//   }
// }

export async function fetchAllBlockedUsers() {
  const fetcher = pongAxios();
  const response = await fetcher.get(`chat/block/all`);

  return z.array(returnAllBlockedUsersSchema).parse(response.data);
}
