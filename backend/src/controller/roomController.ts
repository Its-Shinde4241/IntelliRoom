import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import "../config/types";

class RoomController {
    private static handleError(res: Response, error: any, message: string): void {
        console.error(message + ":", error);
        res.status(500).json({ error: message + (error.message ? ": " + error.message : "") });
    }

    public async getUserRooms(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            const result = await prisma.room.findMany({
                where: { userId: userId }, include: {
                    files: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        }
                    }
                }
            });
            res.status(200).json(result);
        } catch (error) {
            RoomController.handleError(res, error, "Failed to fetch rooms");
        }
    }

    public async getRoom(req: Request, res: Response): Promise<void> {
        try {
            const roomId = req.params.id;
            const result = await prisma.room.findUnique({ where: { id: roomId } });
            res.status(200).json(result);
        } catch (error) {
            RoomController.handleError(res, error, "Failed to fetch room");
        }
    }

    public async createRoom(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            const { name, password } = req.body;
            if (!userId) {
                res.status(401).json({ error: "User not authenticated" });
                return;
            }
            if (!password) {
                res.status(400).json({ error: "Password is required to create a room" });
                return;
            }
            const alreadyExists = await prisma.room.findFirst({
                where: { name, userId }
            })
            if (alreadyExists) {
                res.status(400).json({ error: "Room with this name already exists for the user" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await prisma.room.create({
                data: {
                    id: crypto.randomUUID(),
                    name,
                    password: hashedPassword,
                    userId
                }
            });
            res.status(201).json(result);
        } catch (error) {
            RoomController.handleError(res, error, "Failed to create room");
        }
    }

    public async updateRoom(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            const { id } = req.params;
            const { name, password } = req.body;
            const result = await prisma.room.update({
                where: { id: id, userId: userId },
                data: {
                    name,
                    password
                }
            });
            res.status(200).json(result);
        } catch (error) {
            RoomController.handleError(res, error, "Failed to update room");
        }
    }

    public async deleteRoom(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            const roomId = req.params.id;
            await prisma.room.delete({
                where: {
                    id: roomId,
                    userId: userId
                }
            });
            res.status(204).send();
        } catch (error) {
            RoomController.handleError(res, error, "Failed to delete room");
        }
    }

    public async getRoomFiles(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            const { roomId } = req.params;
            const result = await prisma.file.findMany({
                where: {
                    roomId: roomId,
                    userId: userId
                }
            });
            res.status(200).json(result);
        } catch (error) {
            RoomController.handleError(res, error, "Failed to fetch room files");
        }
    }
}

export const roomController = new RoomController();