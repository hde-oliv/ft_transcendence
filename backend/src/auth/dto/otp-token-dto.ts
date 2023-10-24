import { z } from 'zod';

export const otpTokenSchema = z
  .object({
    token: z.string().regex(/^([0-9]){6}$/g, 'Token does not comply with expected value'),
  })
  .required();

export type OTPTokenDto = z.infer<typeof otpTokenSchema>;
