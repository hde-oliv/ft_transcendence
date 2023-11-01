import z from 'zod';

export const userReturnInfo = z.object({
  nickname: z.string(),
  intra_login: z.string(),
  online: z.boolean(),
  otp_enabled: z.boolean(),
  otp_verified: z.boolean(),
});

export const authResponse42 = z.object({
  access_token: z.string(),
  token_type: z.string().startsWith('bearer').length(6),
  expires_in: z.number().int(),
  refresh_token: z.string(),
  scope: z.string().startsWith('public').length(6),
  created_at: z.number().int(),
  secret_valid_until: z.number().int(),
});

export const user42Schema = z.object({
  id: z.number(),
  email: z.string(),
  login: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  usual_full_name: z.string(),
  usual_first_name: z.nullable(z.string()),
  url: z.string(),
  phone: z.string(),
  displayname: z.string(),
  kind: z.string(),
});

export const tokenClaimsSchema = z.object({
  nickname: z.string(),
  intra_login: z.string(),
  online: z.boolean(),
  otp_enabled: z.boolean(),
  otp_verified: z.boolean(),
});

export type authResponse42 = z.infer<typeof authResponse42>;
export type user42Data = z.infer<typeof user42Schema>;
export type userLoginRet = z.infer<typeof userReturnInfo>;
export type TokenClaims = z.infer<typeof tokenClaimsSchema>;
