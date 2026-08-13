import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};
