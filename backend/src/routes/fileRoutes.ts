import { Router } from "express";

const Filerouter = Router();

Filerouter.get("/", (req, res) => {
    res.send("File route");
});