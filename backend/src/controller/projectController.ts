import { Request, Response } from "express";
import { prisma } from "../db/prisma";

class ProjectController {
    private static handleError(res: Response, error: any, message: string): void {
        console.error(message + ":", error);
        res.status(500).json({ error: message + (error.message ? ": " + error.message : "") });
    }

    public async getProjectFiles(req: Request, res: Response): Promise<void> {
        try {
            const { projectId } = req.params;
            const result = await prisma.file.findMany({ where: { projectId } });
            res.status(200).json(result);
        } catch (error) {
            ProjectController.handleError(res, error, "Failed to fetch project files");
        }
    }

    public async createProjectWithFiles(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { projectName } = req.body;
            const existingProject = await prisma.project.findFirst({
                where: { name: projectName, userId }
            });
            if (existingProject) {
                res.status(409).json({ error: "Project with this name already exists" });
                return;
            }
            const project = await prisma.project.create({
                data: {
                    name: projectName,
                    userId
                }
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
  <script src="script.js"></script>
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
            await prisma.file.createMany({
                data: defaultFiles.map((file) => ({
                    userId: userId,
                    projectId: project.id,
                    ...file,
                })),
            })
            res.status(201).json(project);
        } catch (error) {
            ProjectController.handleError(res, error, "Failed to create project");
        }
    }
    public async getUserProjects(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            const projects = await prisma.project.findMany({
                where: { userId: userId },
                // include: { files: true }
            });
            res.status(200).json(projects);
        } catch (error) {
            ProjectController.handleError(res, error, "Failed to fetch user projects");
        }
    }

    public async updateProjectWithFiles(req: Request, res: Response): Promise<void> {
        try {
            const { projectId, projectName } = req.body;
            const project = await prisma.project.update({
                where: { id: projectId },
                data: { name: projectName },
            });
            res.status(200).json(project);
        } catch (error) {
            ProjectController.handleError(res, error, "Failed to update project");
        }
    }

    public async deleteProject(req: Request, res: Response): Promise<void> {
        try {
            const { projectId } = req.params;
            await prisma.project.delete({
                where: { id: projectId },
            });
            res.status(204).send();
        } catch (error) {
            ProjectController.handleError(res, error, "Failed to delete project");
        }
    }
}


export const projectController = new ProjectController();