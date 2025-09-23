import { Router } from "express";
import { projectController } from "../controller/projectController";
import authenticate from "../middleware/auth";

const projectRouter = Router();
projectRouter.get("/user/:id", authenticate, projectController.getUserProjects);
projectRouter.get("/:projectId/files", authenticate, projectController.getProjectFiles);
projectRouter.post("/", authenticate, projectController.createProjectWithFiles);
projectRouter.put("/", authenticate, projectController.updateProjectWithFiles);
projectRouter.delete("/:projectId", authenticate, projectController.deleteProject);

export default projectRouter;