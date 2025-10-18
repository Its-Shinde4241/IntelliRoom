import express, { Response } from "express";
import http from "http";
// import { WebSocketServer } from "ws";

import cors from "cors";
import Authrouter from "./routes/authRoutes";
import authenticate from "./middleware/auth";
import roomRouter from "./routes/roomRoutes";
import projectRouter from "./routes/projectRoutes";
import fileRouter from "./routes/fileRoutes";
import AgentRouter from "./routes/agentRouter";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
    origin: "https://intelli-room.vercel.app", credentials: true
}))

app.get("/api", (req, res) => {
    res.send("<h1>on intelliroom backend api</h1>");
})


app.use("/api/auth", Authrouter);
app.use("/api/rooms", authenticate, roomRouter);
app.use("/api/files", authenticate, fileRouter);
app.use("/api/projects", authenticate, projectRouter);
app.use("/api/agent", authenticate, AgentRouter);

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${process.env.PORT || PORT}`);
});
