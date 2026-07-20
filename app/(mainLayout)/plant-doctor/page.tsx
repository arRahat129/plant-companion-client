"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import { Button, Card } from "@heroui/react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { RefreshCw, Send, Stethoscope, Leaf, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

function ChatBubble({ role, text }: Message) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mr-2 mt-1 shrink-0">
          <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
          ? "bg-emerald-600 text-white rounded-br-md"
          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md"
          }`}
      >
        {isUser ? (
          <p>{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-sm prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-emerald-700 dark:prose-strong:text-emerald-400">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mr-2 mt-1 shrink-0">
        <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function PlantDoctorPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!session?.user) {
      toast.error("Please log in to use Plant Doctor.");
      return;
    }

    const question = input.trim();
    const updatedMessages = [...messages, { role: "user" as const, text: question }];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/diseases/doctor-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.user.id || "",
          "x-user-name": session.user.name || "",
          "x-user-email": session.user.email || "",
          "x-user-image": session.user.image || "",
        },
        body: JSON.stringify({
          query: question,
          chatHistory: messages,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages([...updatedMessages, { role: "model", text: data.reply }]);
      } else {
        const errMsg = data.message || "Failed to get answer";
        toast.error(errMsg);
        setMessages([...updatedMessages, { role: "model", text: `⚠️ ${errMsg}` }]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while contacting Plant Doctor");
      setMessages([...updatedMessages, { role: "model", text: "⚠️ Network error. Please check your connection and try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestedQuestions = [
    "Why are my tomato leaves turning yellow?",
    "How do I treat powdery mildew?",
    "Best natural pest control methods?",
    "How often should I water my indoor plants?",
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="text-center mb-4 shrink-0">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
          <Stethoscope className="w-3.5 h-3.5" />
          AI Plant Pathologist
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Plant Doctor
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Ask anything about plant care, disease treatment, pest control, or gardening tips.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 mb-4">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Welcome to Plant Doctor
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              I can help diagnose plant issues, suggest treatments, and provide expert gardening advice. Try asking:
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!session?.user) {
                      toast.error("Please log in to use Plant Doctor.");
                      return;
                    }
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role} text={msg.text} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 space-y-2">
        {messages.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-md"
            >
              <Trash2 className="w-3 h-3" />
              Clear chat
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder={session?.user ? "Ask about plant care, diseases, or treatments..." : "Log in to start chatting..."}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all placeholder:text-slate-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !session?.user}
          />
          <Button
            type="submit"
            isDisabled={isLoading || !input.trim() || !session?.user}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 rounded-xl transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}