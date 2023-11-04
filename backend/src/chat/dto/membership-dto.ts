import z from 'zod';

export const membershipSchema = z
  .object({
    channelId: z.number(),
    userId: z.string(),
  })
  .required();

export type MembershipDto = z.infer<typeof membershipSchema>;
