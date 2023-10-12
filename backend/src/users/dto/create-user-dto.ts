import { z } from 'zod';

export const createUserSchema = z.object({
  nickname: z.string(),
  avatar: z.string(),
  intra_login: z.string(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
