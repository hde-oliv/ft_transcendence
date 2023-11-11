import { pongAxios } from "./pongAxios";
import z from "zod";

const loginResponse = z.object({
  access_token: z.string(),
});

export async function sendSsoCode(ssoCode: string) {
  const fetcher = pongAxios();
  const response = await fetcher.post("auth/login", { token: ssoCode });
  const parsedResp = loginResponse.parse(response.data);
  return parsedResp.access_token;
}
