import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



type ChatMessage = {
  id: number;
  text: string;
  isBot: boolean;
};

type Bubble = {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
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
  const [spawnedBubbles, setSpawnedBubbles] = useState<Bubble[]>([]);

  // Generates a number of bubbles with random properties and schedules their removal.
  const spawnBubbles = (count = 15) => {
    const newBubbles: Bubble[] = Array.from({ length: count }, (_, i) => {
      const id = Date.now() + i;
      const left = `${Math.random() * 100}%`; // random horizontal position
      const size = Math.random() * 40 + 20; // size between 20px and 60px
      const duration = Math.random() * 5 + 5; // duration between 5s and 10s
      const delay = Math.random() * 2; // delay between 0s and 2s
      return { id, left, size, duration, delay };
    });
    setSpawnedBubbles((prev) => [...prev, ...newBubbles]);

    // Remove each bubble after its animation (duration + delay) completes
    newBubbles.forEach((bubble) => {
      setTimeout(() => {
        setSpawnedBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
      }, (bubble.duration + bubble.delay) * 1000);
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: input,
      isBot: false,
    };

    // Update messages with the new user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Spawn extra bubbles whenever the user sends a message
    spawnBubbles();

    // Prepare messages for the API call
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
        content: userMessage.text,
      },
    ];

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: apiMessages }),
      });


      const data = await response.json();
      const botReply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't get a response at the moment.";

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-cyan-200 pb-20 md:pb-0 md:pt-20">
      {/* Bubbles Container */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Static Bubbles */}
        <div className="bubble bubble1"></div>
        <div className="bubble bubble2"></div>
        <div className="bubble bubble3"></div>
        <div className="bubble bubble4"></div>
        <div className="bubble bubble5"></div>
        {/* Dynamically Spawned Bubbles */}
        {spawnedBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="spawned-bubble"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animation: `rise ${bubble.duration}s ${bubble.delay}s forwards`,
            }}
          ></div>
        ))}
      </div>

      <Navigation />

      <main className="relative z-10 max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md font-[pixel] animate-float">
            Chat with AquaBot
          </h1>
          <p className="text-gray-700 text-lg">
            Dive in and learn about ocean conservation
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Chat Window */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-cyan-100 shadow-2xl mb-4 h-[450px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 transition-all ${message.isBot ? "text-left" : "text-right"}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-2xl leading-relaxed ${message.isBot
                    ? "bg-cyan-100 text-cyan-900 shadow"
                    : "bg-cyan-600 text-white shadow-md"
                    }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ocean conservation..."
              className="flex-1 bg-sky-100/80 text-sky-900 placeholder-sky-500 focus:bg-sky-100 focus:ring-2 focus:ring-cyan-300 border border-cyan-300"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {loading ? "Thinking..." : "Send"}
            </Button>
          </form>
        </div>
      </main>

      {/* Bubble Animations */}
      <style>{`
        .bubble {
          position: absolute;
          bottom: -100px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          animation: rise 10s infinite;
        }

        .bubble1 {
          left: 20%;
          width: 50px;
          height: 50px;
          animation-duration: 12s;
        }
        .bubble2 {
          left: 50%;
          width: 30px;
          height: 30px;
          animation-duration: 8s;
          animation-delay: 2s;
        }
        .bubble3 {
          left: 80%;
          width: 60px;
          height: 60px;
          animation-duration: 14s;
          animation-delay: 4s;
        }
        .bubble4 {
          left: 35%;
          width: 20px;
          height: 20px;
          animation-duration: 10s;
          animation-delay: 1s;
        }
        .bubble5 {
          left: 65%;
          width: 45px;
          height: 45px;
          animation-duration: 11s;
          animation-delay: 3s;
        }

        .spawned-bubble {
          position: absolute;
          bottom: -100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-800px) scale(0.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;
