import { z } from 'zod';

export const returnUserSchema = z.object({
  nickname: z.string(),
  avatar: z.string(),
  intra_login: z.string(),
  status: z.string(),
  elo: z.number(),
});

export type ReturnUserDto = z.infer<typeof returnUserSchema>;
