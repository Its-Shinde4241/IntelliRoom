import { Router } from "express";
import { upsertUser } from "../controller/authController";
import authenticate from "../middleware/auth";
import { prisma } from "../db/prisma";

const Authrouter = Router();

Authrouter.post("/sync", authenticate, async (req, res) => {
    try {
        const { uid, email, displayName, createdAt, updatedAt } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ error: "Missing user info" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: uid }
        });

        if (existingUser) {
            return res.status(200).json({ message: "User already exists", user: existingUser });
        }

        await upsertUser({ uid, email, displayName, createdAt, updatedAt });
        
        res.status(200).json({ message: "User synced successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error", details: err });
    }
});

export default Authrouter;