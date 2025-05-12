"use client";
import React, { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import { auth } from "@/lib/firebase/firebase.config";
import Link from "next/link";

type Message = {
  id: number;
  sender: "me" | "other";
  content: string;
  timestamp: string;
};

export default function ChatInterface() {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [chatStarted, setChatStarted] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log('User', auth.currentUser);

    auth.currentUser?.getIdToken().then((token) => {
      // ✅ Connect only once
      socketRef.current = io("http://localhost:8888", {
        auth: {
          token: token
        }
      });

      console.log(token);
      console.log('socket created');

      // ✅ Listen to incoming messages
      socketRef.current.on("newMessage", (mes: string) => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "other",
            content: mes,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      });

    })

    return () => {
      socketRef.current?.disconnect(); // ✅ Clean up on unmount
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async () => {
    if (!selectedEmail.trim()) return;
    setChatStarted(true);
    setMessages([
      {
        id: 1,
        sender: "other",
        content: `Hey! You're now chatting with ${selectedEmail}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    socketRef.current?.emit("sendMessage", {
      selectedEmail, message: `Hey! You're now chatting with ${auth.currentUser?.email}`
    });
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "me",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socketRef.current?.emit("sendMessage", input);

    // setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <>
      <Link href='/login' className="flex items-center justify-center  ">
        <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
          login
        </button>
      </Link>

      <div className="max-w-2xl my-8 mx-auto border rounded-2xl shadow-md h-[80vh] flex flex-col">

        <div className="p-4 border-b flex gap-2 items-center">
          <input
            type="email"
            placeholder="Enter recipient's email..."
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={startChat}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Talk
          </button>
        </div>

        {chatStarted && (
          <>
            <ScrollArea className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[75%] mb-2",
                    msg.sender === "me" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm",
                      msg.sender === "me"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-black"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </ScrollArea>

            <div className="p-4 border-t flex gap-2 items-center">
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
