import { z } from 'zod';

export const returnMeSchema = z.object({
  nickname: z.string(),
  avatar: z.string(),
  intra_login: z.string(),
});

export type returnMeDto = z.infer<typeof returnMeSchema>;
