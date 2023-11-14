import { io } from "socket.io-client";
import { wsBaseUrl } from "../fetchers/pongAxios";
import { getToken } from "../TokenMagagment";


const chatSocket = io(wsBaseUrl, {
	autoConnect: false,
	extraHeaders: {
		Authorization: getToken()
	}
})

export default chatSocket;