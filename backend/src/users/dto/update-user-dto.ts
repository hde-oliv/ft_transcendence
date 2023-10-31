import { z } from 'zod';

export const updateUserSchema = z.object({
  nickname: z.string().optional(),
  avatar: z.string().optional(),
  intra_login: z.string(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
