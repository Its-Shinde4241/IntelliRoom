import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../db/prisma";
import { verifyIdToken } from "../db/firebase";
import { generateUniqueId } from "./helper";

// Track connected users per room: roomId (business code) -> Set<userId (business code)>
const presenceMap = new Map<string, Set<string>>();

export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ["https://intelli-room.vercel.app", "http://localhost:5173"],
      credentials: true,
    },
  });

  // Middleware: Validate JWT token
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication token required"));
    }

    try {
      const decodedToken = await verifyIdToken(token);
      socket.data.firebaseUid = decodedToken.uid;

      // Fetch user to get their business code
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.uid },
        select: { userId: true, name: true },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.userCode = user.userId;
      socket.data.userName = user.name;
      next();
    } catch (err) {
      next(new Error("Invalid Firebase token"));
    }
  });

  // Event: User connects
  io.on("connection", (socket: Socket) => {
    console.log(
      `✅ User ${socket.data.userCode} connected. Socket ID: ${socket.id}`,
    );

    // Event: Join room (expects business code: roomId)
    socket.on("join-room", async (roomId: string) => {
      try {
        // Lookup room by business code to get internal id
        const room = await prisma.room.findUnique({
          where: { roomId },
        });

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Validate membership using internal UUID
        const participant = await prisma.roomParticipant.findUnique({
          where: {
            roomId_userId: { roomId: room.id, userId: socket.data.firebaseUid },
          },
        });

        if (!participant) {
          socket.emit("error", { message: "Not a member of this room" });
          return;
        }

        // Add socket to room namespace
        socket.join(`room:${roomId}`);

        // Track presence using business codes
        if (!presenceMap.has(roomId)) {
          presenceMap.set(roomId, new Set());
        }
        presenceMap.get(roomId)!.add(socket.data.userCode);

        // Broadcast user joined with business codes
        io.to(`room:${roomId}`).emit("user-joined", {
          userCode: socket.data.userCode,
          userName: socket.data.userName,
          activeUsers: Array.from(presenceMap.get(roomId) || []),
        });

        console.log(
          `🔵 ${socket.data.userCode} joined room ${roomId}`,
        );
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Event: Leave room (expects business code: roomId)
    socket.on("leave-room", (roomId: string) => {
      socket.leave(`room:${roomId}`);

      // Remove from presence
      const activeUsers = presenceMap.get(roomId);
      if (activeUsers) {
        activeUsers.delete(socket.data.userCode);
        if (activeUsers.size === 0) {
          presenceMap.delete(roomId);
        }
      }

      // Broadcast user left with business codes
      io.to(`room:${roomId}`).emit("user-left", {
        userCode: socket.data.userCode,
        activeUsers: Array.from(activeUsers || []),
      });

      console.log(
        `🔴 ${socket.data.userCode} left room ${roomId}`,
      );
    });

    // Event: Chat message (expects business code: roomId)
    socket.on("send-message", async (roomId: string, message: string) => {
      try {
        // Lookup room by business code to get internal id
        const room = await prisma.room.findUnique({
          where: { roomId },
        });

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Validate membership using internal UUID
        const participant = await prisma.roomParticipant.findUnique({
          where: {
            roomId_userId: { roomId: room.id, userId: socket.data.firebaseUid },
          },
        });

        if (!participant) {
          socket.emit("error", { message: "Not a member of this room" });
          return;
        }

        // Create message with messageId business code
        const savedMessage = await prisma.message.create({
          data: {
            messageId: await generateUniqueId("MS", "message"),
            content: message,
            userId: socket.data.firebaseUid,
            roomId: room.id,
          },
        });

        // Broadcast to room with business codes
        io.to(`room:${roomId}`).emit("receive-message", {
          messageId: savedMessage.messageId,
          content: savedMessage.content,
          userCode: socket.data.userCode,
          userName: socket.data.userName,
          timestamp: savedMessage.createdAt,
        });

        console.log(`💬 Message in room ${roomId}: ${message}`);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Event: WebRTC Offer (expects business code: roomId)
    socket.on("offer", (roomId: string, offer: any) => {
      io.to(`room:${roomId}`).emit("offer", {
        from: socket.data.userCode,
        fromName: socket.data.userName,
        offer: offer,
      });
    });

    // Event: WebRTC Answer (expects business code: roomId)
    socket.on("answer", (roomId: string, answer: any) => {
      io.to(`room:${roomId}`).emit("answer", {
        from: socket.data.userCode,
        fromName: socket.data.userName,
        answer: answer,
      });
    });

    // Event: ICE Candidate (expects business code: roomId)
    socket.on("ice-candidate", (roomId: string, candidate: any) => {
      io.to(`room:${roomId}`).emit("ice-candidate", {
        from: socket.data.userCode,
        candidate: candidate,
      });
    });

    // Event: Disconnect
    socket.on("disconnect", () => {
      // Clean up presence in all rooms
      for (const [roomId, users] of presenceMap.entries()) {
        if (users.has(socket.data.userCode)) {
          users.delete(socket.data.userCode);
          if (users.size === 0) {
            presenceMap.delete(roomId);
          } else {
            io.to(`room:${roomId}`).emit("user-left", {
              userCode: socket.data.userCode,
              activeUsers: Array.from(users),
            });
          }
        }
      }
      console.log(`❌ User ${socket.data.userCode} disconnected`);
    });
  });

  return io;
};

