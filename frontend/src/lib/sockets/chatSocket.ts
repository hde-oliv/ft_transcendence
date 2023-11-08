import { io } from "socket.io-client";
import { baseUrl } from "../fetchers/pongAxios";


const token = () => {
	if (typeof window !== "undefined") return localStorage.getItem("token") ?? "";
	return "";
};

const chatSocket = io(baseUrl, {
	autoConnect: false,
	extraHeaders: {
		Authorization: token()
	}
})

export default chatSocket;