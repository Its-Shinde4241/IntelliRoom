import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

import cors from "cors";
import Authrouter from "./routes/authRoutes";
import authenticate from "./middleware/auth";
import roomRouter from "./routes/roomRoutes";
import projectRouter from "./routes/projectRoutes";
import fileRouter from "./routes/fileRoutes";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
    console.log("🟢 Client connected");

    socket.on("message", (message) => {
        console.log("📨 Received:", message.toString());

        socket.send(`You said: ${message}`);
    });

    socket.on("close", () => {
        console.log("🔴 Client disconnected");
    });
});

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173", credentials: true
}))

app.get("/api", (req, res) => {
    // console.log("Hello World");
    res.send("on intelliroom backend api");
})

app.get("/checkauth", authenticate);

app.use("/api/auth", Authrouter);
app.use("/api/rooms", authenticate, roomRouter);
app.use("/api/rooms/files", authenticate, fileRouter);
app.use("/api/projects", authenticate, projectRouter);

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${process.env.PORT || PORT}`);
});
