import { z } from 'zod';

export const createMembershipSchema = z.object({
  channelId: z.number(),
  userId: z.string(),
  owner: z.boolean().optional(),
  administrator: z.boolean().optional(),
  banned: z.boolean().optional(),
  muted: z.boolean().optional(),
});

export type CreateMembershipDto = z.infer<typeof createMembershipSchema>;
