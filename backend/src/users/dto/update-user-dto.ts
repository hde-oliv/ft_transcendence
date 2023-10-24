import { z } from 'zod';

export const updateUserSchema = z.object({
  nickname: z.string(),
  avatar: z.string(),
  intra_login: z.string(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
