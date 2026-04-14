import { useState, useEffect, useRef } from "react";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const sessionId = "user1";

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message: userInput,
        }),
      });

      const data = await res.json();

      const botMsg = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Server error ❌" },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* FLOAT BUTTON */}
      <div className="fixed bottom-6 md:bottom-10 lg:bottom-16 right-5 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="btn mb-7 mr-10 btn-primary btn-circle text-xl shadow-lg hover:scale-110 transition-transform duration-300"
        >
          💬
        </button>
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-24 md:bottom-28 lg:bottom-32 right-5 w-[90vw] max-w-sm h-[450px] bg-white shadow-2xl rounded-xl flex flex-col border z-50 transition-all duration-300">

          {/* HEADER */}
          <div className="bg-primary text-white p-3 font-bold rounded-t-xl flex justify-between items-center">
            PersonaCV AI 🤖
            <button
              onClick={() => setOpen(false)}
              className="text-white text-lg"
            >
              ✕
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat ${
                  msg.role === "user" ? "chat-end" : "chat-start"
                }`}
              >
                <div
                  className={`chat-bubble ${
                    msg.role === "user"
                      ? "chat-bubble-primary"
                      : "chat-bubble-secondary"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-gray-400 animate-pulse">
                PersonaCV is typing...
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          {/* INPUT */}
          <div className="p-2 flex gap-2 border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="input bg-white text-black input-bordered w-full"
              placeholder="Type message..."
            />

            <button
              onClick={sendMessage}
              className="btn btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}