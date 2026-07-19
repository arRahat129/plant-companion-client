"use client";
import React, { useState, useRef, FormEvent } from "react";
import { Button, Card } from "@heroui/react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "model"; // Synced to match engine specifications cleanly
  text: string;
}

function ChatBubble({ role, text }: Message) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg shadow-sm text-sm ${isUser
          ? "bg-[#244D3F] text-white"
          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          }`}
      >
        {text}
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

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    // Keep local records up to date immediately
    const updatedMessages = [...messages, { role: "user" as const, text: question }];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/plantdoctor/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user?.id || "",
          "x-user-name": session?.user?.name || "",
          "x-user-email": session?.user?.email || "",
          "x-user-image": session?.user?.image || "",
        },
        body: JSON.stringify({
          question,
          history: messages // Sending context history enables multi-turn conversation
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages([...updatedMessages, { role: "model", text: data.answer }]);
      } else {
        const errMsg = data.message || "Failed to get answer";
        toast.error(errMsg);
        setMessages([...updatedMessages, { role: "model", text: errMsg }]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while contacting PlantDoctor");
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-[85vh]">
      <h1 className="text-3xl font-bold mb-4 text-center text-[#244D3F] dark:text-emerald-200">
        🌿 PlantDoctor Chatbot
      </h1>

      <Card className="flex-1 overflow-y-auto p-4 mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
            Ask any plant‑related question – identification, care, disease, you name it!
          </p>
        )}
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="What do I need to know about my tomato plant?"
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#244D3F] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" isDisabled={isLoading || !input.trim()} className="bg-[#244D3F] text-white font-medium">
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              Thinking...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </div>
  );
}