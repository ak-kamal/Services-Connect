import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatWidget() {

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I can help you find providers or check availability." }
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    setTyping(true);

    try {

      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message: input }
      );

      const botMessage = {
        role: "bot",
        text: res.data.reply || JSON.stringify(res.data.data)
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {

      setMessages(prev => [
        ...prev,
        { role: "bot", text: "Sorry, something went wrong." }
      ]);

    }

    setTyping(false);
  };



  return (

    <div className="fixed bottom-6 right-6 z-50">

      {/* CHATBOX */}

      {open && (

        <div className="w-80 h-[420px] bg-white shadow-2xl rounded-xl flex flex-col border">

          {/* HEADER */}

          <div className="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">

            <span className="font-semibold">
              Services Assistant
            </span>

            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>

          </div>



          {/* MESSAGES */}

          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>

              </div>

            ))}



            {typing && (
              <div className="text-xs text-gray-400">
                Assistant is typing...
              </div>
            )}

            <div ref={messagesEndRef}></div>

          </div>



          {/* INPUT */}

          <div className="border-t p-2 flex gap-2">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about providers..."
              className="flex-1 border rounded px-2 py-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Send
            </button>

          </div>

        </div>

      )}



      {/* CHAT BUBBLE */}

      {!open && (

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-xl hover:scale-110 transition"
        >
          💬
        </button>

      )}

    </div>

  );
}