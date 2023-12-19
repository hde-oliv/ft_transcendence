import { z } from 'zod';

export const blockUserStatusSchema = z.object({
  issuerId: z.string(),
  targetId: z.string(),
});

export type BlockUserStatusDto = z.infer<typeof blockUserStatusSchema>;