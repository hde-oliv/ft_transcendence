import { logOff } from "@/components/nav/PongNavBar"
import { AxiosError } from "axios"
import { UnwrapPromise } from "next/dist/lib/coalesced-function"
import { NextRouter } from "next/router"

export async function useAuthSafeFetch<T extends (...args: any[]) => Promise<any>>(router: NextRouter, f: T, ...args: Parameters<T>): Promise<UnwrapPromise<ReturnType<T>>> {
  return f(...args).then((res) => res).catch((e) => {
    if (e instanceof AxiosError) {
      if (e.response?.status === 401) {
        logOff(router, localStorage)
      }
      else {
        throw e
      }
    }
  })
} //TODO, this function may also logOff when the server is offline! manage to handle that!
