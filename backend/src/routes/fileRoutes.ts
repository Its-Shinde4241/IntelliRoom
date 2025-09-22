import { Router } from "express";
import { fileController } from "../controller/fileController";

const fileRouter = Router();

fileRouter.get("/:fileId", fileController.getFileById);
fileRouter.post("/", fileController.createFile);
fileRouter.put("/", fileController.updateFile);
fileRouter.delete("/", fileController.deleteFile);

export default fileRouter;