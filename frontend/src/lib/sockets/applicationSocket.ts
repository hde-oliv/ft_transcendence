import { io } from "socket.io-client";
import { wsBaseUrl } from "../fetchers/pongAxios";
import { getToken } from "../TokenMagagment";


const applicationSocket = io(wsBaseUrl, {
  autoConnect: false,
  extraHeaders: {
    Authorization: getToken()
  }
})

export default applicationSocket;
