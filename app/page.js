"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { gsap } from "gsap";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Assalam-o-Alaikum! Mein aap ka RAG AI assistant hoon. Kisi bhi qism ka sawal puchiye, mein aap ke data se dhoond kar jawab doonga!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Smooth scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // GSAP Animation for new messages entering the chat
    const items = chatContainerRef.current?.querySelectorAll(".message-item");
    if (items && items.length > 0) {
      const lastItem = items[items.length - 1];
      gsap.fromTo(lastItem, 
        { opacity: 0, y: 15, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [messages]);

  // Header Animation on Mount
  useEffect(() => {
    gsap.from(".chat-header", { opacity: 0, y: -20, duration: 0.6, ease: "power3.out" });
    gsap.from(".input-box", { opacity: 0, y: 20, duration: 0.6, delay: 0.2, ease: "power3.out" });
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("https://n8n.dev.laconsultingcorp.com/webhook/879e6f77-d43d-43cc-b537-89c08eb5f2f0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatInput: userMessage }),
      });

      if (!response.ok) throw new Error("Network issues");

      const responseText = await response.text();
      console.log("n8n Raw Text Response:", responseText);

      if (!responseText.trim()) {
        throw new Error("Empty response received from n8n");
      }

      let botResponse = "";

      try {
        const data = JSON.parse(responseText);
        if (typeof data === 'string') {
          botResponse = data;
        } else {
          // n8n ke naye format `{ output: "text" }` ke mutabiq reading:
          botResponse = data.output || data.text || data.response || JSON.stringify(data);
        }
      } catch (e) {
        botResponse = responseText;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: botResponse }]);
    } catch (error) {
      console.error("Webhook Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maazrat, server se rabta nahi ho paa raha. Dobara koshish karen." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      <header className="chat-header bg-slate-900/80 border-b border-slate-800/80 p-4 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide flex items-center gap-1.5">
              RAG AI Agent <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            </h1>
            <p className="text-xs text-slate-400">Direct n8n Integration</p>
          </div>
        </div>
      </header>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl w-full mx-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`message-item flex gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "bg-indigo-600" : "bg-slate-800 border border-slate-700"}`}>
              {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-md ${msg.role === "user" ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none" : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md<li>">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s]"></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-box p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything from your data..."
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-2xl pl-4 pr-14 py-3.5 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm md:text-base transition-all duration-200 backdrop-blur-sm shadow-xl"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 p-2.5 rounded-xl transition-all duration-200 text-white flex items-center justify-center shadow-lg">
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-600 mt-2">Zero Database Architecture • Orchestrated via n8n</p>
      </div>
    </div>
  );
}