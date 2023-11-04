import { z } from 'zod';

export const leaveChannelSchema = z
  .object({
    channelId: z.number(),
  })
  .required();

export type LeaveChannelDto = z.infer<typeof leaveChannelSchema>;
