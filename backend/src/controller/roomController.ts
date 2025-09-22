import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import crypto from "crypto";

class RoomController {
    private static handleError(res: Response, error: any, message: string): void {
        console.error(message + ":", error);
        res.status(500).json({ error: message + (error.message ? ": " + error.message : "") });
    }

    public async getUserRooms(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const result = await prisma.room.findMany({ where: { userId: userId } });
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
            const { name, password, userId } = req.body;
            const alreadyExists = await prisma.room.findFirst({
                where: { name, userId }
            })
            if (alreadyExists) {
                res.status(400).json({ error: "Room with this name already exists for the user" });
                return;
            }
            const result = await prisma.room.create({
                data: {
                    id: crypto.randomUUID(),
                    name,
                    password,
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
            const { id } = req.params;
            const { name, password } = req.body;
            const result = await prisma.room.update({
                where: { id: id },
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
            const roomId = req.params.id;
            await prisma.room.delete({
                where: {
                    id: roomId,
                }
            });
            res.status(204).send();
        } catch (error) {
            RoomController.handleError(res, error, "Failed to delete room");
        }
    }

    public async getRoomFiles(req: Request, res: Response): Promise<void> {
        try {
            const { roomId } = req.params;
            const result = await prisma.file.findMany({ where: { roomId } });
            res.status(200).json(result);
        } catch (error) {
            RoomController.handleError(res, error, "Failed to fetch room files");
        }
    }
}

export const roomController = new RoomController();