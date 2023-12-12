import { pongAxios } from "./pongAxios";
import z from "zod";

const meResponseData = z.object({
  nickname: z.string(),
  avatar: z.string(),
  intra_login: z.string(),
  otp_enabled: z.boolean(),
});

type UpdateUserDto = {
  intra_login: string;
  nickname?: string | undefined;
  avatar?: string | undefined;
};

export type MeResponseData = z.infer<typeof meResponseData>;

export async function getMe() {
  const fetcher = pongAxios();
  const response = await fetcher.get("me");
  return meResponseData.parse(response.data);
}

export async function updateMe(params: UpdateUserDto) {
  const fetcher = pongAxios();
  const response = await fetcher.post("me", params);
  if (response.status !== 201) {
    return false;
  } else {
    return true;
  }
}
