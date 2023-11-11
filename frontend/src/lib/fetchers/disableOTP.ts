import axios from "axios";
import z, { ZodError } from "zod";
import { pongAxios } from "./pongAxios";

export async function disableOTP(otp: string) {
  const token = localStorage.getItem("token");
  if (token === null) return false;
  const fetcher = pongAxios(token);
  const response = await fetcher.post("auth/otp/deactivate", { token: otp });
  if (response.status === 201) {
    return true;
  } else {
    return false;
  }
}
