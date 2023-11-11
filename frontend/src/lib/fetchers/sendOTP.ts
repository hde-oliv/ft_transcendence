import { pongAxios } from "./pongAxios";
import z from "zod";

const otpResponse = z.object({
  access_token: z
    .string()
    .regex(/(^[\w-]*\.[\w-]*\.[\w-]*$)/g, "Response was not a valid token"),
});

export async function sendOTP(otp: string, username: string) {
  const fetcher = pongAxios();
  const response = await fetcher.post("auth/otp/validate", {
    token: otp,
    username: username,
  });
  return otpResponse.parse(response.data).access_token;
}
