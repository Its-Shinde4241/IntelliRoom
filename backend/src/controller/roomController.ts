import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import "../config/types";
import { generateUniqueId } from "../lib/helper";

class RoomController {
  private static handleError(res: Response, error: any, message: string): void {
    console.error(message + ":", error);
    res
      .status(500)
      .json({ error: message + (error.message ? ": " + error.message : "") });
  }

  public async getUserRooms(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;

      // Fetch user to get their userId
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const result = await prisma.room.findMany({
        where: { userId: firebaseUid },
        include: {
          user: {
            select: {
              userId: true,
            },
          },
          files: {
            select: {
              fileId: true,
              name: true,
              type: true,
            },
          },
        },
      });

      res.status(200).json({
        userId: user.userId,
        rooms: result.map((room) => ({
          roomId: room.roomId,
          name: room.name,
          createdBy: room.user.userId,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          files: room.files,
        })),
      });
    } catch (error) {
      RoomController.handleError(res, error, "Failed to fetch rooms");
    }
  }

  public async getRoom(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { roomId } = req.params;
      const result = await prisma.room.findUnique({
        where: { roomId: roomId },
        include: {
          user: {
            select: { userId: true },
          },
        },
      });

      if (!result) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      res.status(200).json({
        roomId: result.roomId,
        createdBy: result.user.userId,
        name: result.name,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      });
    } catch (error: any) {
      RoomController.handleError(res, error, "Failed to fetch room");
    }
  }

  public async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { name, password } = req.body;
      if (!firebaseUid) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      if (!password) {
        res
          .status(400)
          .json({ error: "Password is required to create a room" });
        return;
      }
      const alreadyExists = await prisma.room.findFirst({
        where: { name, userId: firebaseUid },
      });
      if (alreadyExists) {
        res
          .status(400)
          .json({ error: "Room with this name already exists for the user" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Fetch user to get their userId
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const result = await prisma.room.create({
        data: {
          id: crypto.randomUUID(),
          roomId: await generateUniqueId("RM", "room"),
          name,
          isPublic: false,
          password: hashedPassword,
          userId: firebaseUid,
        },
      });
      await prisma.roomParticipant.create({
        data: {
          participantId: await generateUniqueId("MEM", "member"),
          roomId: result.id,
          userId: firebaseUid,
        },
      });
      res.status(201).json({
        roomId: result.roomId,
        name: result.name,
        createdBy: user.userId,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      });
    } catch (error) {
      RoomController.handleError(res, error, "Failed to create room");
    }
  }

  public async updateRoom(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
      });
      if (!user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }
      const { roomId } = req.params;
      const { name, password } = req.body;
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;
      const result = await prisma.room.update({
        where: { roomId: roomId, userId: user?.id },
        data: {
          name,
          ...(hashedPassword && { password: hashedPassword }),
        },
      });
      res.status(200).json({
        roomId: result.roomId,
        name: result.name,
        updatedBy: user.userId,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      });
    } catch (error) {
      RoomController.handleError(res, error, "Failed to update room");
    }
  }

  public async deleteRoom(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { roomId } = req.params;

      // Lookup room by roomId (business code) to verify ownership
      const room = await prisma.room.findUnique({
        where: { roomId: roomId },
      });

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      // Verify ownership
      if (room.userId !== firebaseUid) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      await prisma.room.delete({
        where: { id: room.id }, // Delete by internal UUID
      });
      res.status(204).send();
    } catch (error) {
      RoomController.handleError(res, error, "Failed to delete room");
    }
  }

  public async joinRoom(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { roomId, password } = req.body;

      if (!firebaseUid || !roomId || !password) {
        res.status(400).json({ error: "roomId and password required" });
        return;
      }

      // Fetch room
      const room = await prisma.room.findUnique({ where: { roomId: roomId } });
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      // Validate password
      const passwordMatch = await bcrypt.compare(password, room.password);
      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid password" });
        return;
      }

      // Fetch user to get their userId
      const joiningUser = await prisma.user.findUnique({
        where: { id: firebaseUid },
      });

      if (!joiningUser) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Check if already joined
      const existing = await prisma.roomParticipant.findUnique({
        where: { roomId_userId: { roomId: room.id, userId: firebaseUid } },
      });

      if (existing) {
        res.status(200).json({
          message: "Already a member",
          room: {
            roomId: room.roomId,
            name: room.name,
            createdAt: room.createdAt,
          },
          joinedAs: joiningUser.userId,
        });
        return;
      }

      // Add participant
      await prisma.roomParticipant.create({
        data: {
          participantId: await generateUniqueId("MEM", "member"),
          roomId: room.id,
          userId: firebaseUid,
        },
      });

      res.status(200).json({
        message: "Joined room successfully",
        room: {
          roomId: room.roomId,
          name: room.name,
          createdAt: room.createdAt,
        },
        joinedAs: joiningUser.userId,
      });
    } catch (error: any) {
      RoomController.handleError(res, error, "Failed to join room");
    }
  }

  public async getRoomDetails(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { roomId } = req.params;

      if (!firebaseUid) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      // Fetch current user to get their userId
      const currentUser = await prisma.user.findUnique({
        where: { id: firebaseUid },
      });

      if (!currentUser) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Validate user is a participant
      const participant = await prisma.roomParticipant.findUnique({
        where: { roomId_userId: { roomId, userId: firebaseUid } },
      });

      if (!participant) {
        res.status(403).json({ error: "Not a member of this room" });
        return;
      }

      // Fetch room with participants and files
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          participants: {
            include: {
              user: { select: { userId: true, name: true, email: true } },
            },
          },
          files: {
            select: { fileId: true, name: true, type: true, updatedAt: true },
          },
        },
      });

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      res.status(200).json({
        roomId: room.roomId,
        name: room.name,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        currentUserId: currentUser.userId,
        participants: room.participants.map((p) => ({
          userId: p.user.userId,
          name: p.user.name,
          email: p.user.email,
          joinedAt: p.joinedAt,
        })),
        files: room.files,
      });
    } catch (error: any) {
      RoomController.handleError(res, error, "Failed to fetch room details");
    }
  }
  public async getRoomFiles(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { roomId } = req.params;

      // ✅ Lookup room by business code to get internal UUID
      const room = await prisma.room.findUnique({
        where: { roomId: roomId },
        include: {
          user: {
            select: { userId: true },
          },
        },
      });

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      const result = await prisma.file.findMany({
        where: {
          roomId: room.id, // ✅ Use internal UUID, not business code
          userId: userId,
        },
        select: {
          fileId: true,
          name: true,
          type: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Map to File interface with roomId and createdBy
      res.status(200).json(
        result.map((file) => ({
          ...file,
          roomId: room.roomId,
          createdBy: room.user.userId,
        })),
      );
    } catch (error: any) {
      RoomController.handleError(res, error, "Failed to fetch room files");
    }
  }
}

export const roomController = new RoomController();
