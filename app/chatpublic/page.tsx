"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaPaperPlane } from "react-icons/fa6";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/get-event-info",{
        query:input,
      });
      console.log(response.data);
      setMessages([
        ...newMessages,
        { role: "assistant", content: response.data?.response.tasks_output[0].raw },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-screen p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chat with AI</h1>
        <Button
          variant="outline"
          onClick={() => setMessages([])}
          disabled={loading}
        >
          Clear Chat
        </Button>
      </div>
      <Card className="flex-1 overflow-scroll rounded-lg shadow-md  bg-white ">
        <ScrollArea className="min-h-[65vh] p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 italic">
              No messages yet.
              <br />
              Start the conversation by typing a message!
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs 
              ${
                msg.role === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-black"
              }
              ${index === 0 ? "mt-4" : "mt-2"}
              ${index === messages.length - 1 ? "mb-4" : ""}
              ${msg.role === "user" ? "rounded-br-none" : "rounded-bl-none"}
              ${msg.role === "user" ? "rounded-tl-lg" : "rounded-tr-lg"}
              ${msg.role === "user" ? "rounded-tr-lg" : "rounded-tl-lg"}
              ${msg.role === "user" ? "rounded-bl-lg" : "rounded-br-lg"}
              ${msg.role === "user" ? "rounded-tl-none" : "rounded-tr-none"}
              ${msg.role === "user" ? "rounded-br-none" : "rounded-bl-none"}
              ${msg.role === "user" ? "rounded-tr-none" : "rounded-tl-none"}
              ${msg.role === "user" ? "rounded-bl-none" : "rounded-br-none"}
              ${msg.role === "user" ? "rounded-tl-none" : "rounded-tr-none"}
              ${msg.role === "user" ? "rounded-br-none" : "rounded-bl-none"}
              ${msg.role === "user" ? "rounded-tr-none" : "rounded-tl-none"}
              ${msg.role === "user" ? "rounded-bl-none" : "rounded-br-none"}
              ${msg.role === "user" ? "rounded-tl-none" : "rounded-tr-none"}
              ${msg.role === "user" ? "rounded-br-none" : "rounded-bl-none"}
              ${msg.role === "user" ? "rounded-tr-none" : "rounded-tl-none"}
              ${msg.role === "user" ? "rounded-bl-none" : "rounded-br-none"}
              ${msg.role === "user" ? "rounded-tl-none" : "rounded-tr-none"}
              ${msg.role === "user" ? "rounded-br-none" : "rounded-bl-none"}

                ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200 text-black"
                }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin h-5 w-5 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </ScrollArea>
      </Card>
      <div className="flex items-center gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading}>
          <FaPaperPlane className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
