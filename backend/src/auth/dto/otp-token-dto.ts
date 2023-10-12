import { z } from 'zod';

export const otpTokenSchema = z
  .object({
    token: z.string().length(6),
  })
  .required();

export type OTPTokenDto = z.infer<typeof otpTokenSchema>;
