import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export async function getUserFiles(req: Request, res: Response) {
    const roomId = req.body();
    const result = await prisma.file.findMany({
        where: { roomId: roomId }
    });
    res.status(200).json(result);
}

export async function createFile(req: Request, res: Response) {
    const { type, name, content, roomId, projectId } = req.body;
    const result = await prisma.file.create({
        data: {
            type,
            name,
            content,
            roomId,
            projectId
        }
    });
    res.status(201).json(result);
}
