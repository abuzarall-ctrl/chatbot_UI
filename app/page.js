"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { supabase } from "../lib/supabaseClient";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    // GSAP animation for new messages
    if (messageContainerRef.current) {
      const newMessages = messageContainerRef.current.querySelectorAll(".animate-in");
      if (newMessages.length > 0) {
        gsap.fromTo(newMessages, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: "power3.out" }
        );
        // Remove the class after animation to prevent re-animating
        newMessages.forEach(el => el.classList.remove('animate-in'));
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch initial messages from Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .gt('created_at', oneWeekAgo)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setMessages([{ role: "assistant", content: "Maazrat, purani chat history load karne mein masla aa raha hay." }]);
      } else if (data.length === 0) {
        setMessages([{ role: "assistant", content: "Assalam-o-Alaikum! Mein aap ka RAG AI assistant hoon. Puchiye kya puchna hay?" }]);
      } else {
        setMessages(data);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newUserMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    // Save user message to Supabase
    await supabase.from('messages').insert([newUserMessage]);

    try {
      const response = await fetch("https://n8n.dev.laconsultingcorp.com/webhook/879e6f77-d43d-43cc-b537-89c08eb5f2f0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatInput: userMessage }),
      });

      if (!response.ok) throw new Error("Network issues");

      // Response ko pehle plain text mein parhein taake crash na ho
      const responseText = await response.text();
      console.log("n8n Raw Text Response:", responseText);

      if (!responseText.trim()) {
        throw new Error("Empty response received from n8n");
      }

      let botResponse = "";

      // Check karen agar n8n ne valid JSON bheja hay
      try {
        const data = JSON.parse(responseText);
        if (typeof data === 'string') {
          botResponse = data;
        } else if (Array.isArray(data) && data[0]) {
          botResponse = data[0].output || data[0].text || data[0].response || JSON.stringify(data[0]);
        } else {
          botResponse = data.output || data.text || data.response || data.message || JSON.stringify(data);
        }
      } catch (e) {
        // Agar response JSON nahi hay balkay plain text hay, to direct use maren
        botResponse = responseText;
      }

      const newBotMessage = { role: "assistant", content: botResponse };
      setMessages((prev) => [...prev, newBotMessage]);
      // Save bot message to Supabase
      await supabase.from('messages').insert([newBotMessage]);
    } catch (error) {
      console.error("Webhook Error:", error);
      const errorMessage = { role: "assistant", content: "Maazrat, n8n server se connect karne mein kuch masla aa raha hay. Dobara koshish karen." };
      setMessages((prev) => [...prev, errorMessage]);
      // Save error message to Supabase
      await supabase.from('messages').insert([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-slate-100 font-sans">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 -z-10"></div>

      <header className="bg-slate-900/50 border-b border-slate-800/50 p-4 sticky top-0 z-10 backdrop-blur-xl flex items-center justify-between shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide flex items-center gap-1.5">
              Chat by Abuzar <Sparkles className="w-4 h-4 text-blue-400 fill-blue-400" />
            </h1>
            <p className="text-xs text-slate-400">Your AI Assistant</p>
          </div>
        </div>
      </header>

      <div ref={messageContainerRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-8 max-w-3xl w-full mx-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 animate-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${msg.role === "user" ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-slate-800 border border-slate-700/50"}`}>
              {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-400" />}
            </div>
            <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed shadow-xl selection:bg-purple-500 ${msg.role === "user" ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-none" : "bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-bl-none backdrop-blur-sm"}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-in">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center shrink-0 shadow-lg">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-4 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-xl backdrop-blur-sm">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s]"></span>
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything from your data..."
            className="w-full bg-slate-800/50 text-slate-100 placeholder-slate-400 rounded-2xl pl-5 pr-16 py-4 border border-slate-700/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 text-sm md:text-base transition-all duration-300 backdrop-blur-md shadow-2xl shadow-black/20"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 p-2.5 rounded-xl transition-all duration-300 text-white flex items-center justify-center shadow-lg hover:shadow-purple-500/20 disabled:shadow-none">
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-center text-slate-500 mt-3">Powered by Next.js & n8n RAG Orchestration</p>
      </div>
    </div>
  );
}