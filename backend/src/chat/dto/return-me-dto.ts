import { z } from 'zod';

export const returnMeSchema = z.object({
  nickname: z.string(),
  avatar: z.string(),
  intra_login: z.string(),
  otp_enabled: z.boolean(),
  otp_verified: z.boolean(),
});

export type returnMeDto = z.infer<typeof returnMeSchema>;
