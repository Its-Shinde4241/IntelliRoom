import { Router } from "express";
import { upsertUser } from "../controller/authController";
import authenticate from "../middleware/auth";
import { prisma } from "../db/prisma";

const Authrouter = Router();


Authrouter.post("/sync", authenticate, async (req, res) => {
    try {
        const { uid, email, displayName } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ error: "Missing user info" });
        }
        if (prisma.user.findMany({ where: { id: uid } }) != undefined) {
            return res.status(404).json({ error: "user already there" });
        }
        const user = await upsertUser({ uid, email, displayName });
        res.status(200).json({ message: "User synced successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error :", err });
    }
});

export default Authrouter;