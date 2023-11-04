import { z } from 'zod';

export const joinChannelSchema = z.object({
  channelId: z.number(),
  password: z.string().optional(),
});

export type JoinChannelDto = z.infer<typeof joinChannelSchema>;
