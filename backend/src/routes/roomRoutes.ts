import { Router } from "express";
import { roomController } from "../controller/roomController";

const roomRouter = Router();

roomRouter.get("/user/:id", roomController.getUserRooms);
roomRouter.get("/:id", roomController.getRoom);
roomRouter.post("/", roomController.createRoom);
roomRouter.put("/:id", roomController.updateRoom);
roomRouter.delete("/:id", roomController.deleteRoom);
roomRouter.get("/:roomId/files", roomController.getRoomFiles);

export default roomRouter;