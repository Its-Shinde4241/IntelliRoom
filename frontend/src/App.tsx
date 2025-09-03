import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "./components/LoginForm";
import { Toaster } from "sonner";
import api from "./lib/axiosInstance";

export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const [temp, setTemp] = useState<String | null>();

  useEffect(() => {
    api.get("/").then((res) => {
      setTemp(JSON.stringify(res.data));
    });
    const socket = new WebSocket("ws://localhost:3001");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket");
      setMessages((prev) => [...prev, "✅ Connected to WebSocket"]);
    };

    socket.onmessage = (event) => {
      console.log("📩 Message from server:", event.data);
      setMessages((prev) => [...prev, `📩 ${event.data}`]);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setMessages((prev) => [...prev, "❌ WebSocket disconnected"]);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleSend = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(input);
      setMessages((prev) => [...prev, `📤 ${input}`]);
      setInput("");
    }
  };

  return (
    <>
      <Toaster richColors />
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">🔌 WebSocket Tester</h1>

        <Card>
          <CardContent className="p-4 h-64 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className="text-sm">
                {msg}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
      <div>
        <LoginForm />
      </div>
      <div>
        <p>{temp}</p>
      </div>
    </>
  );
}
