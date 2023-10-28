import { z } from 'zod';

export const otpValidationPayload = z
  .object({
    token: z.string().length(6),
    username: z.string()
  })
  .required();

export type OtpValidationPayload = z.infer<typeof otpValidationPayload>;
