// import { useEffect, useState, useRef } from "react";
// import { connectSocket, getSocket } from "../lib/socket.js";
// import { getMessages, sendMessageApi } from "../api/axiosClient.js";

// const Chat = ({ chatId, token, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const scrollRef = useRef(null);

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     const socket = connectSocket(token);
//     socket.emit("joinChat", chatId);

//     socket.on("receiveMessage", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     // FIXED: Accessing data.data because of the Interceptor + Backend structure
//     getMessages(chatId)
//       .then((res) => {
//         setMessages(res.data || []); 
//       })
//       .catch((err) => console.error("Load Error:", err));

//     return () => socket.disconnect();
//   }, [chatId, token]);

//   const sendMessage = async () => {
//     if (!text.trim()) return;

//     try {
//       // API call sends { chatId, content }
//       await sendMessageApi(chatId, text);

//       const socket = getSocket();
//       socket.emit("sendMessage", { chatId, content: text });

//       setText("");
//     } catch (error) {
//       // This will now show the clear error from your backend if it fails
//       console.error("Failed to send message:", error);
//     }
//   };

//   return (
//     <div className="fixed bottom-5 right-5 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
//       <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
//         <h3 className="font-semibold text-lg">Chat Support</h3>
//         <button onClick={onClose} className="hover:bg-indigo-500 rounded-full p-1">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       </div>

//       <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
//         {messages.map((m, i) => {
//           const isMe = !m.sender || m.sender._id === JSON.parse(localStorage.getItem('user'))?._id; 
//           return (
//             <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
//               <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
//                 isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
//               }`}>
//                 <p>{m.content}</p>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={scrollRef} />
//       </div>

//       <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
//         <input
//           className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//           placeholder="Type a message..."
//         />
//         <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;




import { useEffect, useState, useRef } from "react";
import { connectSocket, getSocket } from "../lib/socket.js";
import { getMessages, sendMessageApi } from "../api/axiosClient.js";

const Chat = ({ chatId, token, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    const socket = connectSocket(token);
    socket.emit("joinChat", chatId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Load initial messages
    getMessages(chatId)
      .then((res) => {
        // Your backend returns { success: true, data: [...] }
        setMessages(res.data || []); 
      })
      .catch((err) => console.error("Load Error:", err));

    return () => socket.disconnect();
  }, [chatId, token]);

  const sendMessage = async () => {
    // 1. Validation: Don't send if text is empty OR chatId is missing
    if (!text.trim() || !chatId) {
        console.error("Missing text or Chat ID", { chatId });
        return;
    }

    try {
      // 2. API call - Sending 'chatId' as a string to match the backend controller
      await sendMessageApi(chatId, text);

      // 3. Socket Notification
      const socket = getSocket();
      socket.emit("sendMessage", { chatId, content: text });

      setText("");
    } catch (error) {
      console.error("API Error Response:", error);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
        <h3 className="font-semibold text-lg">Chat Support</h3>
        <button onClick={onClose} className="hover:bg-indigo-500 rounded-full p-1 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => {
          // Adjust 'isMe' logic based on your stored user data
          const isMe = m.sender?._id === JSON.parse(localStorage.getItem('user'))?._id || m.sender === "You";
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
              }`}>
                <p>{m.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
        <input
          className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button 
          onClick={sendMessage}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;