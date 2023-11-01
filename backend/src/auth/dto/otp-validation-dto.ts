import { z } from 'zod';

export const otpValidationSchema = z
  .object({
    token: z
      .string()
      .regex(/^([0-9]){6}$/g, 'Token does not comply with expected value'),
    username: z.string(),
  })
  .required();

export type OTPValidationDto = z.infer<typeof otpValidationSchema>;
