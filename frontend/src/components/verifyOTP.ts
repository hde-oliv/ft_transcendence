import { pongAxios } from "../lib/fetchers/pongAxios";

export const steps = [
  { title: "Load QRcode", description: "Point your camera at the QRcode" },
  {
    title: "Confirmation",
    description: "Insert the code generated in your phone",
  },
];
export async function verifyOTP(otp: string) {
  //TODO allow fetchers to throw errors?
  const token = localStorage.getItem("token");
  if (token === null) return false;
  const fetcher = pongAxios(token);
  try {
    const response = await fetcher.post("auth/otp/verify", { token: otp });
    if (response.status === 201) return true;
  } catch (e) {
    return false;
  }
}
