// import { io } from "socket.io-client";

// let socket;

// export const connectSocket = (token) => {
//   socket = io("http://localhost:4000", {
//     auth: { token }
//   });

//   return socket;
// };

// export const getSocket = () => socket;


// src/lib/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  // ✅ Prevent multiple connections
  if (socket && socket.connected) {
    return socket;
  }

  socket = io("http://localhost:4000", {
    auth: { token },
    transports: ["websocket"], // more reliable than polling
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call connectSocket() first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};