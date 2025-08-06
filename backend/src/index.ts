import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
    console.log("🟢 Client connected");

    socket.on("message", (message) => {
        console.log("📨 Received:", message.toString());

        // Echo back the message
        socket.send(`You said: ${message}`);
    });

    socket.on("close", () => {
        console.log("🔴 Client disconnected");
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
