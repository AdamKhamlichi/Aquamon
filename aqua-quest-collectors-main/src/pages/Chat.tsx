// File: src/pages/Chat.tsx

import React, { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useInteractionSound } from "@/hooks/use-interaction-sound";

const Chat = () => {
  const { handlers } = useInteractionSound();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm AquaBot 🌊 Ask me anything about ocean conservation!",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages update
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Prepare the user message and update state
    const userMessage = {
      id: Date.now(),
      text: input,
      isBot: false,
    };

    // Create an updated messages array to send as payload
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Call the serverless function /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      // Assuming the API returns data in the format:
      // { choices: [ { message: { role: "assistant", content: "..." } } ] }
      const botResponse = data.choices?.[0]?.message?.content;
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse || "Sorry, I couldn't generate a response.",
        isBot: true,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in handleSend:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, there was an error processing your request.",
        isBot: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent pb-20 md:pb-0 md:pt-20">
      <Navigation />

      <main className="relative z-10 max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <h1 className="text-4xl font-bold text-white mb-2 font-pixel">
              <MessageCircle className="inline-block w-8 h-8 mr-2" />
              Ocean Chat
            </h1>
            <p className="text-cyan-100 max-w-md">
              Learn about marine life and ocean conservation
            </p>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Chat Window */}
          <motion.div
            layout
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg mb-4 h-[450px] overflow-y-auto relative"
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-4 ${message.isBot ? "text-left" : "text-right"}`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${message.isBot
                      ? "bg-cyan-500/20 text-cyan-100 rounded-tl-sm"
                      : "bg-blue-500/20 text-blue-100 rounded-tr-sm"
                      }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center space-x-2 text-cyan-100 absolute bottom-4 left-4">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-cyan-400/50 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm text-cyan-200/70">
                  AquaBot is typing...
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </motion.div>

          {/* Input Field */}
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ocean conservation..."
              className="flex-1 bg-white/10 backdrop-blur-md text-cyan-100 placeholder:text-cyan-300/50 border-white/20"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 backdrop-blur-sm"
            >
              {loading ? "Thinking..." : "Send"}
            </Button>
          </form>

          {/* Quick Questions */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {[
              "🐠 Tell me about coral reefs",
              "🌊 Ocean pollution",
              "🐋 Marine mammals",
              "🦈 Shark conservation",
            ].map((question) => (
              <button
                key={question}
                {...handlers}
                onClick={() => setInput(question)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-cyan-100 rounded-full text-sm backdrop-blur-sm border border-white/10 transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
