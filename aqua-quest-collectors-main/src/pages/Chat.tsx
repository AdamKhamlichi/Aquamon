import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// WARN: This is insecure. Do NOT commit real keys to public repos.
const OPENAI_API_KEY = "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";

type ChatMessage = {
  id: number;
  text: string;
  isBot: boolean;
};

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm AquaBot. Ask me anything about ocean conservation!",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user's message to the state
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: input,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Prepare the messages in OpenAI's format
    // We transform our {isBot, text} into {role: "user"|"assistant", content: "..."}
    // Also add a system message or context if you want specialized behavior
    const apiMessages = [
      {
        role: "system",
        content:
          "You are AquaBot, an AI assistant that provides information on ocean conservation and related topics.",
      },
      ...messages.map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.text,
      })),
      {
        role: "user",
        content: input,
      },
    ];

    setLoading(true);

    try {
      // Call the OpenAI Chat Completions API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      // Extract assistant's reply from the response
      const botReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";

      // Add the assistant's message to the state
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: botReply,
        isBot: true,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      const errorReply: ChatMessage = {
        id: Date.now() + 1,
        text: "Oops, something went wrong. Please try again later.",
        isBot: true,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-[pixel] animate-float">
            Chat with AquaBot
          </h1>
          <p className="text-gray-600">Learn about ocean conservation</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-100 shadow-lg mb-4 h-[400px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.isBot ? "text-left" : "text-right"}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-2xl ${message.isBot
                    ? "bg-primary/10 text-primary"
                    : "bg-primary text-white"
                    }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ocean conservation..."
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Thinking..." : "Send"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Chat;
