import { z } from 'zod';

export const updateMembershipSchema = z.object({
  owner: z.boolean().optional(),
  administrator: z.boolean().optional(),
  banned: z.boolean().optional(),
  muted: z.boolean().optional(),
});

export type UpdateMembershipDto = z.infer<typeof updateMembershipSchema>;
