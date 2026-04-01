import { Router } from "express";
import { roomController } from "../controller/roomController";

const roomRouter = Router();

roomRouter.get("/user", roomController.getUserRooms);
roomRouter.post("/join", roomController.joinRoom);
roomRouter.post("/", roomController.createRoom);
roomRouter.get("/:roomId", roomController.getRoom);
roomRouter.put("/:roomId", roomController.updateRoom);
roomRouter.delete("/:roomId", roomController.deleteRoom);
roomRouter.get("/:roomId/files", roomController.getRoomFiles);
roomRouter.get("/:roomId/details", roomController.getRoomDetails);

export default roomRouter;
