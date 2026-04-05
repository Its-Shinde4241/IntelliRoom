import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { generateUniqueId } from "../lib/helper";

class ProjectController {
  private static handleError(res: Response, error: any, message: string): void {
    console.error(message + ":", error);
    res
      .status(500)
      .json({ error: message + (error.message ? ": " + error.message : "") });
  }

  public async getProjectFiles(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { projectId } = req.params;

      // Lookup project by projectId (business code) to get internal id
      const project = await prisma.project.findUnique({
        where: { projectId },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      // Verify ownership
      if (project.userId !== firebaseUid) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      // Fetch user to get their userId
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const result = await prisma.file.findMany({
        where: {
          projectId: project.id,
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
      
      // Add projectId and createdBy to each file
      const filesWithMetadata = result.map((file: any) => ({
        ...file,
        projectId: project.projectId,
        createdBy: user.userId,
      }));
      
      res.status(200).json(filesWithMetadata);
    } catch (error: any) {
      ProjectController.handleError(
        res,
        error,
        "Failed to fetch project files",
      );
    }
  }

  public async createProjectWithFiles(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      if (!firebaseUid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const { projectName } = req.body;
      const existingProject = await prisma.project.findFirst({
        where: { name: projectName, userId: firebaseUid },
      });
      if (existingProject) {
        res
          .status(409)
          .json({ error: "Project with this name already exists" });
        return;
      }

      // Fetch user to get their userId
      const user = await prisma.user.findUnique({
        where: { id: firebaseUid },
      });

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const project = await prisma.project.create({
        data: {
          projectId: await generateUniqueId("PR", "project"),
          name: projectName,
          userId: firebaseUid,
        },
      });
      const defaultFiles = [
        {
          name: "index",
          type: "html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello from ${projectName}!</h1>
  <script src="script.js"><\\/script>
</body>
</html>`,
        },
        {
          name: "style",
          type: "css",
          content: `body {
  font-family: Arial, sans-serif;
  text-align: center;
}`,
        },
        {
          name: "script",
          type: "js",
          content: `console.log("Welcome to ${projectName}!");`,
        },
      ];
      if (project.id === undefined) {
        console.error("Project ID is undefined");
        return;
      }
      await prisma.file.createMany({
        data: await Promise.all(
          defaultFiles.map((file) =>
            generateUniqueId("FL", "file").then((fileId) => ({
              fileId,
              userId: firebaseUid,
              projectId: project.id,
              ...file,
            })),
          ),
        ),
      });
      res.status(201).json({
        projectId: project.projectId,
        name: project.name,
        createdBy: user.userId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error: any) {
      ProjectController.handleError(res, error, "Failed to create project");
    }
  }

  public async getUserProjects(req: Request, res: Response): Promise<void> {
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

      const projects = await prisma.project.findMany({
        where: { userId: firebaseUid },
        include: {
          files: {
            select: {
              fileId: true,
              name: true,
              type: true,
            },
          },
          user: {
            select: { userId: true },
          },
        },
      });

      res.status(200).json({
        userCode: user.userId,
        projects: projects.map((project: any) => ({
          projectId: project.projectId,
          name: project.name,
          createdBy: project.user.userId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          files: project.files,
        })),
      });
    } catch (error: any) {
      ProjectController.handleError(
        res,
        error,
        "Failed to fetch user projects",
      );
    }
  }

  public async updateFile(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { projectId, fileId } = req.params;
      const { name, content, type } = req.body;

      // Lookup project by projectId (business code) to get internal id
      const project = await prisma.project.findUnique({
        where: { projectId },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      // Verify ownership
      if (project.userId !== firebaseUid) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      const updatedFile = await prisma.file.update({
        where: {
          fileId: fileId,
          projectId: project.id,
          userId: firebaseUid,
        },
        data: { name, content, type },
        select: {
          fileId: true,
          name: true,
          type: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json(updatedFile);
    } catch (error: any) {
      ProjectController.handleError(res, error, "Failed to update file");
    }
  }

  public async updateProjectName(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { projectId, projectName } = req.body;

      // Lookup project by projectId (business code)
      const projectToUpdate = await prisma.project.findUnique({
        where: { projectId },
        include: {
          user: {
            select: { userId: true },
          },
        },
      });

      if (!projectToUpdate) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      // Verify ownership
      if (projectToUpdate.userId !== firebaseUid) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      const project = await prisma.project.update({
        where: {
          id: projectToUpdate.id,
        },
        data: { name: projectName },
        include: {
          user: {
            select: { userId: true },
          },
        },
      });

      res.status(200).json({
        projectId: project.projectId,
        name: project.name,
        createdBy: project.user.userId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error: any) {
      ProjectController.handleError(
        res,
        error,
        "Failed to update project name",
      );
    }
  }

  public async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const firebaseUid = req.user?.uid;
      const { projectId } = req.params;

      // Lookup project by projectId (business code)
      const project = await prisma.project.findUnique({
        where: { projectId },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      // Verify ownership
      if (project.userId !== firebaseUid) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      await prisma.project.delete({
        where: { id: project.id },
      });
      res.status(204).send();
    } catch (error: any) {
      ProjectController.handleError(res, error, "Failed to delete project");
    }
  }
}

export const projectController = new ProjectController();
