import { z } from 'zod';

export const createInviteSchema = z
  .object({
    user_id: z.string(),
    target_id: z.string(),
  })
  .required();

export type CreateInviteDto = z.infer<typeof createInviteSchema>;

export const responseInviteSchema = createInviteSchema.merge(z.object({fulfilled: z.boolean()}))