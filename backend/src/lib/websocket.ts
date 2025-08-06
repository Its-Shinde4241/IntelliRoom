import { WebSocket, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";

export const setupWebSocket = (server: HttpServer) => {
    const wss = new WebSocketServer({ server })

    wss.on("connection", (socket: WebSocket) => {
        socket.on("message", (message) => {
            console.log("📨 Received:", message.toString());
            socket.send(`You said: ${message}`);
        })

        socket.on("close", () => {
            console.log("🔴 Client disconnected");
        });
    })
}
