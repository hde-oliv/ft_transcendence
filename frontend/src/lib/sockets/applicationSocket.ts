import { io } from "socket.io-client";
import { wsBaseUrl } from "../fetchers/pongAxios";
import { getToken } from "../TokenMagagment";


const applicationSocket = io(wsBaseUrl, {
  // autoConnect: true,
  extraHeaders: {
    Authorization: getToken()
  }
})

export default applicationSocket;
