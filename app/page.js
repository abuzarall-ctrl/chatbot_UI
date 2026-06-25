"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Sparkles, MessageSquare, Plus, Menu, X } from "lucide-react";
import { gsap } from "gsap";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const chatHistory = [
    { id: 1, title: "RAG System Overview" },
    { id: 2, title: "Data Processing Pipeline" },
    { id: 3, title: "n8n Workflow Details" },
    { id: 4, title: "Supabase Integration Query" },
  ];

  return (
    <aside className={`h-full bg-gray-950/80 backdrop-blur-lg z-20 transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
      <div 
        className="p-4 flex items-center h-[69px] cursor-pointer" 
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-semibold text-white whitespace-nowrap">Chat History</h2>
            <X className="w-5 h-5 flex-shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center items-center w-full">
            <Menu className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <button className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 transition-colors mb-4 ${!isSidebarOpen && 'justify-center'}`}>
          <Plus className="w-4 h-4 flex-shrink-0" />
          {isSidebarOpen && <span className="whitespace-nowrap">New Chat</span>}
        </button>
        <nav className="flex flex-col gap-1">
          {chatHistory.map(chat => (
            <a key={chat.id} href="#" className={`flex items-center gap-3 p-2.5 rounded-md text-sm text-gray-300 hover:bg-gray-800/80 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              {isSidebarOpen && <span className="truncate">{chat.title}</span>}
            </a>
          ))}
        </nav>
      </div>

      <div className={`p-4 border-t border-gray-800/60 transition-opacity duration-300 ${!isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-xs text-center text-gray-500 whitespace-nowrap">Zero DB • Frontend Session History</p>
      </div>
    </aside>
  );
};

const ChatMessage = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className="message-item flex items-start gap-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-blue-600' : 'bg-gray-800'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
      </div>
      <div className="flex flex-col pt-0.5">
        <p className="font-semibold text-gray-300 mb-1">{isUser ? 'You' : 'AI Agent'}</p>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
      </div>
    </div>
  );
};

const LoadingIndicator = () => (
  <div className="message-item flex items-start gap-4">
    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
      <Sparkles className="w-4 h-4 text-blue-400" />
    </div>
    <div className="flex items-center gap-2 pt-2.5">
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s]"></span>
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
    </div>
  </div>
);

const ChatInput = ({ input, setInput, handleSend, isLoading }) => (
  <div className="input-box p-4 bg-transparent sticky bottom-0">
    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything from your data..."
        className="w-full bg-gray-700/60 text-gray-100 placeholder-gray-400 rounded-full pl-5 pr-14 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-lg"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2.5 w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-all duration-200 text-white flex items-center justify-center shadow-md">
        <Send className="w-4 h-4" />
      </button>
    </form>
  </div>
);

export default function ChatbotUI() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Assalam-o-Alaikum! Mein aap ka RAG AI assistant hoon. Kisi bhi qism ka sawal puchiye, mein aap ke data se dhoond kar jawab doonga!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const items = chatContainerRef.current?.querySelectorAll(".message-item");
    if (items && items.length > 0) {
      const lastItem = items[items.length - 1];
      gsap.fromTo(lastItem, 
        { opacity: 0, y: 20, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [messages]);

  useEffect(() => {
    gsap.fromTo(".chat-header", 
      { opacity: 0, y: -20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.2 }
    );
    gsap.fromTo(".input-box", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.4 }
    );
  }, []);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // History maintain karne ke liye current state + new message merge kiya
    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Backup URL lagaya hai agar env load na ho sake
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://n8n.dev.laconsultingcorp.com/webhook/879e6f77-d43d-43cc-b537-89c08eb5f2f0";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chatInput: userMessage,
          history: updatedMessages // Poori chat history payload ke sath pass ho gayi!
        }),
      });

      if (!response.ok) throw new Error("Network issues");

      const responseText = await response.text();
      if (!responseText.trim()) throw new Error("Empty response received from n8n");

      let botResponse = "";
      try {
        const data = JSON.parse(responseText);
        botResponse = data.output || data.text || (typeof data === 'string' ? data : JSON.stringify(data));
      } catch (e) {
        botResponse = responseText;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: botResponse }]);
    } catch (error) {
      console.error("Error communicating with webhook:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maazrat, server se rabta nahi ho paa raha. Dobara koshish karen." }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]); // dependency array mein messages add kiya taake history functional rahe

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 font-sans overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="flex-1 flex flex-col bg-gray-950/80">
        <header className="chat-header bg-gray-950/80 border-b border-gray-800/60 p-4 sticky top-0 z-10 backdrop-blur-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-wide text-white flex items-center gap-2">
                RAG AI Agent
              </h1>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
        </header>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 max-w-4xl w-full mx-auto">
          {messages.map((msg, index) => (
            <ChatMessage key={index} msg={msg} />
          ))}

          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput input={input} setInput={setInput} handleSend={handleSend} isLoading={isLoading} />
      </main>
    </div>
  );
}