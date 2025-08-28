import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

import cors from "cors";
import Authrouter from "./routes/authRoutes";

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


app.use(cors({
    origin: "http://localhost:5173", credentials: true
}))

app.get("/", (req, res) => {
    console.log("Hello World");
    res.send("on intelliroom backend api");
})


app.use("/api/auth", Authrouter);

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${process.env.PORT || PORT}`);
});
