import { Router } from "express";
import { projectController } from "../controller/projectController";
import authenticate from "../middleware/auth";

const projectRouter = Router();
projectRouter.get("/", authenticate, projectController.getUserProjects);
projectRouter.get("/:projectId/files", authenticate, projectController.getProjectFiles);
projectRouter.post("/", authenticate, projectController.createProjectWithFiles);
projectRouter.put("/", authenticate, projectController.updateProjectName);
projectRouter.put("/:projectId/files/:fileId", authenticate, projectController.updateFile);
projectRouter.delete("/:projectId", authenticate, projectController.deleteProject);

export default projectRouter;