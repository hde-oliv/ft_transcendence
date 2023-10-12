import { z } from 'zod';

export const updateOTPUserSchema = z.object({
  id: z.number().optional(),
  intra_login: z.string(),
  otp_auth_url: z.string().optional(),
  otp_base32: z.string().optional(),
  otp_enabled: z.boolean().optional(),
  otp_verified: z.boolean().optional(),
});

export type UpdateOTPUserDto = z.infer<typeof updateOTPUserSchema>;
