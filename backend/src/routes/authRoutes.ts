import { Router } from "express";
import { upsertUser } from "../controller/authController";

const Authrouter = Router();


Authrouter.post("/sync", async (req, res) => {
    try {
        const { uid, email, displayName } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ error: "Missing user info" });
        }
        const user = await upsertUser({ uid, email, displayName });
        res.status(200).json({ message: "User synced successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default Authrouter;