import { Router } from "express";
import { fileController } from "../controller/fileController";

const fileRouter = Router();

fileRouter.get("/:fileId", fileController.getFileById);
fileRouter.post("/", fileController.createFile);
fileRouter.put("/:fileId", fileController.updateFile);
fileRouter.delete("/:fileId", fileController.deleteFile);

export default fileRouter;