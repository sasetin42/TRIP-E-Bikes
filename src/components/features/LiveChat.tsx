import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  MessageCircle, X, Send, Minimize2, Maximize2, Zap,
  Loader2, CheckCircle, Bot, User, Clock, Star
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import logoMain from "@/assets/logo-main.png";

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: "customer" | "agent" | "bot";
  sender_name: string;
  message: string;
  read: boolean;
  created_at: string;
}

const BOT_WELCOME = "👋 Hi! Welcome to **TRIP Mobility** support. I'm your AI assistant — ask me anything about our e-bikes, pricing, or service!\n\n⚡ I can answer immediately, and a specialist can join if you need further help.";

const QUICK_ACTIONS = [
  { label: "🛵 View E-Bikes", message: "What e-bike models do you offer and what are the prices?" },
  { label: "💰 Get a Quote", message: "How do I request a custom quotation?" },
  { label: "🔧 Service Center", message: "Where are your service centers located?" },
  { label: "🏢 Fleet Inquiry", message: "I'm interested in bulk/fleet pricing for my business" },
];

// Conversation history for AI context (last N turns)
interface ConvTurn {
  role: "user" | "assistant";
  content: string;
}

const CHAT_FAQS = [
  {
    q: "🛵 What are the available models and prices?",
    a: "We offer three premium models tailored to your needs:\n\n1. **TRIP Cargo Pro** (₱58,000) – High-capacity utility and deliveries.\n2. **TRIP Fold X** (₱45,000) – Ultra-portable folding commuter.\n3. **TRIP Ranger 750** (₱62,000) – High-power mountain fat tire trail master.",
    msg: "What e-bike models do you offer and what are the prices?"
  },
  {
    q: "🛡️ What is the warranty coverage?",
    a: "TRIP E-Bikes include an exceptional warranty:\n\n- **1-Year Frame warranty** against manufacturing defects.\n- **1-Year Motor warranty** covering hardware integrity.\n- **1-Year Battery warranty** ensuring range capacity.",
    msg: "What is the warranty coverage on TRIP e-bikes?"
  },
  {
    q: "📍 Where is your showroom located?",
    a: "Visit our main flagship showroom at **105 Maryland Street, Cubao, Quezon City, Metro Manila**. We are open for test rides daily!",
    msg: "Where is your store located and what are your hours?"
  },
  {
    q: "💳 Do you offer installment plans?",
    a: "Yes, we support flexible installments via Billease, local banking partners, and major credit cards at our store.",
    msg: "What financing and installment plans do you offer?"
  }
];

export default function LiveChat() {
  const { customer } = useCustomerAuth();
  const { settings } = useSystemSettings();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [agentOnline] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [convHistory, setConvHistory] = useState<ConvTurn[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check if chat is enabled
  useEffect(() => {
    apiClient.get("/settings.php").then(({ data }) => {
      if (data && Array.isArray(data)) {
        const chatSetting = data.find((s: any) => s.key === "chat_enabled");
        if (chatSetting) setChatEnabled(chatSetting.value !== false);
      }
    });
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (open && !minimized) scrollToBottom(); }, [messages, open, minimized]);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await apiClient.get(`/chat.php?session_id=${sessionId}`);
    if (data && data.messages) {
      const mapped = data.messages.map((m: any) => ({
        ...m,
        id: String(m.id),
        sender_type: m.sender_type === "user" ? "customer" : m.sender_type,
        sender_name: m.sender_type === "user" ? "You" : (m.sender_type === "bot" ? "TRIP AI" : "Agent"),
        read: m.read === 1 || m.read === true
      }));
      setMessages(mapped);
      if (!open || minimized) {
        const unread = mapped.filter((m: any) => m.sender_type !== "customer" && !m.read).length;
        setUnreadCount(unread);
      }
    }
  }, [sessionId, open, minimized]);

  useEffect(() => {
    if (!sessionId) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages, sessionId]);

  useEffect(() => {
    if (open && !minimized && sessionId) {
      setUnreadCount(0);
      apiClient.post("/chat.php?action=read", { session_id: sessionId });
    }
  }, [open, minimized, sessionId]);

  const startSession = async () => {
    const name = customer?.username || guestName.trim() || "Visitor";
    const email = customer?.email || guestEmail.trim() || null;
    const generatedId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    
    const { data, error } = await apiClient.post("/chat.php?action=create_session", {
      session_id: generatedId,
      user_name: name,
      user_email: email
    });
    if (error || !data) {
      toast.error(error?.message || "Failed to initialize chat session.");
      return;
    }
    
    setSessionId(generatedId);
    setStarted(true);
    setShowQuickActions(true);
    
    await apiClient.post("/chat.php", {
      session_id: generatedId,
      sender: "bot",
      message: BOT_WELCOME
    });
    
    await fetchMessages();
  };

  const getAIResponse = async (userMessage: string, history: ConvTurn[]) => {
    setAiTyping(true);
    const { data, error } = await apiClient.post("/ai-chat-bot.php", {
      message: userMessage,
      conversation_history: history,
    });

    setAiTyping(false);
    if (error) {
      console.error("AI chat error:", error.message);
      return null;
    }
    return data?.reply || null;
  };

  const sendMessage = async (msgOverride?: string) => {
    const msg = (msgOverride ?? input).trim();
    if (!msg || !sessionId || sending) return;
    setInput("");
    setShowQuickActions(false);
    setSending(true);

    // Insert customer message
    await apiClient.post("/chat.php", {
      session_id: sessionId,
      sender: "user",
      message: msg
    });
    
    await fetchMessages();
    setSending(false);

    // Build conversation history for AI (last 6 turns)
    const currentHistory = [...convHistory, { role: "user" as const, content: msg }];
    const trimmedHistory = currentHistory.slice(-12); // last 6 exchanges

    // Get AI response
    const aiReply = await getAIResponse(msg, trimmedHistory.slice(0, -1));
    if (aiReply) {
      await apiClient.post("/chat.php", {
        session_id: sessionId,
        sender: "bot",
        message: aiReply
      });
      setConvHistory([...trimmedHistory, { role: "assistant" as const, content: aiReply }]);
      await fetchMessages();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

  const renderMessageText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: bold }} className="block" />;
    });
  };

  if (location.pathname.startsWith("/admin")) return null;
  if (!chatEnabled) return null;

  return (
    <>
      {/* Toggle Button */}
      {!open && (
        <button onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[150] w-14 h-14 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-all duration-300 border border-white/10"
          style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-black animate-bounce">{unreadCount}</span>
          )}
          <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-10" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={`fixed z-[150] flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ease-out ${minimized ? "bottom-6 right-6 w-80 h-[60px]" : "bottom-6 right-6 w-[400px] h-[600px] max-h-[90vh]"}`}
          style={{ background: "white", boxShadow: "0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)", backdropFilter: "blur(20px)" }}>

          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 border-b border-black/5 shrink-0 cursor-pointer select-none"
            style={{ background: "linear-gradient(135deg, rgba(57,255,20,0.08) 0%, transparent 100%)" }}
            onClick={() => setMinimized(!minimized)}>
            <div className="shrink-0">
              {settings?.brand_logo_main || settings?.brand_logo_dark || logoMain ? (
                <img
                  src={settings?.brand_logo_main || settings?.brand_logo_dark || logoMain}
                  alt={settings?.brand_name || "TRIP Mobility"}
                  className="h-10 w-auto object-contain shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#00B074]/15 border border-[#00B074]/25 flex items-center justify-center shadow-[0_0_12px_rgba(0,176,116,0.2)]">
                  <Zap className="w-5 h-5 text-[#00B074]" fill="currentColor" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-orbitron font-bold text-sm text-gray-900">TRIP AI Support</p>
              <p className="text-[10px] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00B074] animate-pulse" />
                <span className="text-[#00B074] font-semibold">AI-Powered · Instant Answers</span>
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && minimized && (
                <span className="w-5 h-5 bg-[#00B074] rounded-full flex items-center justify-center text-white text-[10px] font-black">{unreadCount}</span>
              )}
              <button onClick={e => { e.stopPropagation(); setMinimized(!minimized); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={e => { e.stopPropagation(); setOpen(false); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none bg-white">
                {!started ? (
                  /* Start Screen */
                  <div className="flex flex-col items-center justify-center h-full text-center py-4">
                    {settings?.brand_logo_main || settings?.brand_logo_dark || logoMain ? (
                      <div className="h-20 flex items-center justify-center mb-5 shrink-0">
                        <img
                          src={settings?.brand_logo_main || settings?.brand_logo_dark || logoMain}
                          alt={settings?.brand_name || "TRIP Mobility"}
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00B074]/15 to-[#00FFFF]/8 border border-[#00B074]/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,176,116,0.15)]">
                        <Bot className="w-10 h-10 text-[#00B074]" />
                      </div>
                    )}
                    <h3 className="font-orbitron font-bold text-lg text-gray-900 mb-1">TRIP AI Assistant</h3>
                    <p className="text-gray-500 text-xs mb-5 max-w-52 leading-relaxed">
                      Powered by AI — get instant answers about our e-bikes, pricing, and service centers.
                    </p>

                    <div className="flex gap-4 mb-6">
                      {[
                        { icon: Bot, label: "AI-Powered", sub: "instant" },
                        { icon: Star, label: "4.9/5", sub: "rating" },
                        { icon: CheckCircle, label: "Always", sub: "available" },
                      ].map((s, i) => (
                        <div key={i} className="text-center">
                          <s.icon className="w-4 h-4 text-[#00B074] mx-auto mb-1" />
                          <p className="text-xs font-bold text-gray-800">{s.label}</p>
                          <p className="text-[10px] text-gray-400">{s.sub}</p>
                        </div>
                      ))}
                    </div>

                    {!customer && (
                      <div className="w-full space-y-2.5 mb-4">
                        <input id="chat-name" name="name" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Your name (optional)"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#00B074]/50 transition-all bg-gray-50" />
                        <input id="chat-email" name="email" type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="Email (optional — for follow-up)"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#00B074]/50 transition-all bg-gray-50" />
                      </div>
                    )}
                    {customer && (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 w-full text-left">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs">{customer.username[0].toUpperCase()}</div>
                        <div className="text-left">
                          <p className="text-xs text-gray-950 font-semibold">{customer.username}</p>
                          <p className="text-[10px] text-emerald-700/80">Logged in · Priority support</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-[#00B074] ml-auto" />
                      </div>
                    )}
                    <button onClick={startSession} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                      <Bot className="w-4 h-4" />Chat with AI Assistant
                    </button>
                    <p className="text-[10px] text-gray-400 mt-3">
                      Powered by{" "}
                      <a
                        href="https://sasewebsolutions.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#00B074] underline transition-colors"
                      >
                        SaSe
                      </a>{" "}
                      · TRIP Mobility
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isCustomer = msg.sender_type === "customer";
                      const isBot = msg.sender_type === "bot";
                      const isAgent = msg.sender_type === "agent";
                      const showAvatar = idx === 0 || messages[idx - 1].sender_type !== msg.sender_type;
                      return (
                        <div key={msg.id} className={`flex gap-2 ${isCustomer ? "flex-row-reverse" : "flex-row"} ${!showAvatar ? (isCustomer ? "pr-10" : "pl-10") : ""}`}>
                          {!isCustomer && showAvatar && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${isBot ? "bg-[#00B074]/10 border border-[#00B074]/20 text-[#00B074]" : "bg-gray-100 border border-gray-200 text-gray-700"}`}>
                              {isBot ? <Bot className="w-4 h-4" /> : msg.sender_name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="max-w-[78%] space-y-1">
                            {showAvatar && !isCustomer && (
                              <p className="text-[10px] text-gray-400 pl-1 text-left">
                                {isBot ? "TRIP AI" : msg.sender_name}
                                {isBot && <span className="ml-1.5 px-1.5 py-0.5 bg-[#00B074]/10 text-[#00B074] rounded text-[9px] font-bold border border-[#00B074]/20">AI</span>}
                              </p>
                            )}
                            <div className={`rounded-2xl px-4 py-3 text-left ${isCustomer
                              ? "bg-[#00B074] text-white rounded-br-md"
                              : isBot
                              ? "bg-gray-100 border border-gray-200/40 text-gray-800 rounded-bl-md"
                              : "bg-sky-50 border border-sky-100 text-sky-950 rounded-bl-md"
                            }`} style={{ boxShadow: isCustomer ? "0 4px 12px rgba(0,176,116,0.15)" : isAgent ? "0 4px 12px rgba(14,165,233,0.1)" : undefined }}>
                              <div className="text-sm leading-relaxed space-y-0.5">
                                {renderMessageText(msg.message)}
                              </div>
                              <p className={`text-[9px] mt-1.5 ${isCustomer ? "text-white/80 text-right" : "text-gray-400 text-left"}`}>
                                {formatTime(msg.created_at)}
                                {isCustomer && <span className="ml-1">✓✓</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* AI Typing Indicator */}
                    {aiTyping && (
                      <div className="flex gap-2 items-end">
                        <div className="w-8 h-8 rounded-full bg-[#00B074]/10 border border-[#00B074]/20 flex items-center justify-center text-[#00B074] shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-gray-100 border border-gray-200/40 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00B074] animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-[#00B074] animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-[#00B074] animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* FAQ Accordion */}
                {started && showQuickActions && messages.length <= 2 && (
                  <div className="space-y-2 mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center mb-2">Frequently Asked Questions</p>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {CHAT_FAQS.map((faq, i) => {
                        const isOpen = openFaqIndex === i;
                        return (
                          <div key={i} className="border border-gray-200/50 rounded-xl overflow-hidden bg-white transition-colors">
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                              className="w-full text-left px-3 py-2.5 flex items-center justify-between text-xs text-gray-700 hover:text-black hover:bg-gray-50 transition-colors font-medium"
                            >
                              <span>{faq.q}</span>
                              <span className="text-gray-400 font-mono text-[10px]">{isOpen ? "−" : "+"}</span>
                            </button>
                            {isOpen && (
                              <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-gray-50/50">
                                <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{faq.a}</p>
                                <div className="mt-3 flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      sendMessage(faq.msg);
                                      setShowQuickActions(false);
                                    }}
                                    className="text-[10px] font-bold bg-[#00B074]/10 border border-[#00B074]/25 hover:bg-[#00B074]/20 hover:border-[#00B074]/40 text-[#00B074] px-2.5 py-1 rounded-lg transition-all"
                                  >
                                    Send to Chat
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Satisfaction rating */}
                {started && messages.some(m => m.sender_type === "bot" && m.message !== BOT_WELCOME) && !satisfaction && messages.length > 4 && (
                  <div className="bg-gray-50 rounded-xl border border-gray-200/50 p-3 text-center">
                    <p className="text-xs text-gray-500 mb-2">Was this helpful?</p>
                    <div className="flex justify-center gap-2">
                      {["😞", "😐", "🙂", "😊", "😍"].map((emoji, n) => (
                        <button key={n} onClick={() => { setSatisfaction(n + 1); }} className="text-lg hover:scale-125 transition-transform">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {started && (
                <div className="p-3 border-t border-gray-100 shrink-0 bg-white">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-[#00B074]/40 focus-within:bg-white focus-within:shadow-[0_0_10px_rgba(0,176,116,0.1)] transition-all">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value.slice(0, 500))}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about pricing, specs, service..."
                        rows={1}
                        className="w-full pl-3 pr-8 py-2.5 bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none resize-none scrollbar-none"
                        style={{ maxHeight: "80px" }}
                      />
                      {input && (
                        <button
                          onClick={() => setInput("")}
                          className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Clear message"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button onClick={() => sendMessage()} disabled={!input.trim() || sending || aiTyping}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#00B074] text-white hover:bg-emerald-600 disabled:opacity-40 transition-all shrink-0 active:scale-95"
                      style={{ boxShadow: "0 4px 12px rgba(0,176,116,0.2)" }}>
                      {sending || aiTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-1 mt-2">
                    <span className="text-[9px] text-gray-400">
                      {input.length} / 500 chars
                    </span>
                    <p className="text-[9px] text-gray-400 text-right">
                      TRIP AI · Powered by{" "}
                      <a
                        href="https://sasewebsolutions.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#00B074] underline transition-colors"
                      >
                        SaSe
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
