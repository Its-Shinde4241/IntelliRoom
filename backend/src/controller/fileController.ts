// src/controllers/fileController.ts

import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { SAMPLE_CODES } from "../lib/constants";
import { generateUniqueId } from "../lib/helper";

class FileController {
  private static handleError(res: Response, error: any, message: string): void {
    console.error(message + ":", error);
    res
      .status(500)
      .json({ error: message + (error.message ? ": " + error.message : "") });
  }

  public async getFileByFileId(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { fileId } = req.params;

      // Fetch user to get their business code
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
        select: { userId: true },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const result = await prisma.file.findUnique({
        where: { fileId: fileId, userId: firebaseUid },
        select: {
          fileId: true,
          name: true,
          type: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (result) {
        res.status(200).json({
          ...result,
          createdBy: user.userId,
        });
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      FileController.handleError(res, error, "Failed to fetch file");
      console.error("Failed to fetch file:", error);
    }
  }

  public async createFile(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { type, name, roomId, projectId } = req.body;

      // Fetch user to get their business code
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
        select: { userId: true },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const existingFile = await prisma.file.findFirst({
        where: { name, type, roomId, projectId, userId: firebaseUid },
      });

      if (existingFile) {
        res.status(409).json({ error: "File already exists" });
        return;
      }

      const result = await prisma.file.create({
        data: {
          type,
          fileId: await generateUniqueId("FL", "file"),
          name,
          content: SAMPLE_CODES[type as keyof typeof SAMPLE_CODES],
          roomId,
          projectId,
          userId: firebaseUid,
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

      res.status(201).json({
        ...result,
        createdBy: user.userId,
      });
    } catch (error) {
      FileController.handleError(res, error, "Failed to create file");
    }
  }

  public async updateFile(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { fileId } = req.params;
      const { type, name, content, roomId, projectId } = req.body;

      // Fetch user to get their business code
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
        select: { userId: true },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const result = await prisma.file.update({
        where: { fileId: fileId, userId: firebaseUid },
        data: { type, name, content, roomId, projectId },
        select: {
          fileId: true,
          name: true,
          type: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        ...result,
        createdBy: user.userId,
      });
    } catch (error) {
      FileController.handleError(res, error, "Failed to update file");
    }
  }

  public async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { fileId } = req.params;

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      await prisma.file.delete({
        where: { fileId: fileId, userId: firebaseUid },
      });

      res.status(204).send();
    } catch (error) {
      FileController.handleError(res, error, "Failed to delete file");
    }
  }
}

export const fileController = new FileController();
