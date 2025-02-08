
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm AquaBot. Ask me anything about ocean conservation!", isBot: true },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { id: Date.now(), text: input, isBot: false }]);
    setInput("");
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "That's an interesting question about ocean conservation! Let me help you learn more about protecting our marine friends.",
        isBot: true
      }]);
    }, 1000);
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
                className={`mb-4 ${
                  message.isBot ? "text-left" : "text-right"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-2xl ${
                    message.isBot
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
            <Button type="submit">Send</Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Chat;
