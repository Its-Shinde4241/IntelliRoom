// src/controllers/fileController.ts

import { Request, Response } from "express";
import { prisma } from "../db/prisma";

class FileController {

    private static handleError(res: Response, error: any, message: string): void {
        console.error(message + ":", error);
        res.status(500).json({ error: message + (error.message ? ": " + error.message : "") });
    }

    public async getFileById(req: Request, res: Response): Promise<void> {
        try {
            const { fileId } = req.params;
            const result = await prisma.file.findUnique({ where: { id: fileId } });
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ error: "File not found" });
            }
        } catch (error) {
            FileController.handleError(res, error, "Failed to fetch file");
        }
    }

    public async createFile(req: Request, res: Response): Promise<void> {
        try {
            const { type, name, content, roomId, projectId } = req.body;

            const existingFile = await prisma.file.findFirst({
                where: { name, type, roomId, projectId }
            });

            if (existingFile) {
                res.status(409).json({ error: "File already exists" });
                return;
            }
            const result = await prisma.file.create({
                data: { type, name, content, roomId, projectId }
            });
            res.status(201).json(result);
        } catch (error) {
            FileController.handleError(res, error, "Failed to create file");
        }
    }

    public async updateFile(req: Request, res: Response): Promise<void> {
        try {
            const { id, type, name, content, roomId, projectId } = req.body;
            const result = await prisma.file.update({
                where: { id },
                data: { type, name, content, roomId, projectId }
            });
            res.status(200).json(result);
        } catch (error) {
            FileController.handleError(res, error, "Failed to update file");
        }
    }

    public async deleteFile(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.body;
            await prisma.file.delete({ where: { id } });
            res.status(204).send();
        } catch (error) {
            FileController.handleError(res, error, "Failed to delete file");
        }
    }
}

export const fileController = new FileController();