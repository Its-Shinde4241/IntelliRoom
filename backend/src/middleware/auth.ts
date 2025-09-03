import { Request, Response, NextFunction } from "express";

import { verifyIdToken } from "../db/firebase";

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decodedUser = await verifyIdToken(token);
        (req as any).user = decodedUser;
        next();

    } catch (error) {
        return res.status(401).json({ error: " Invalid or expired token " });
    }
}

export default authenticate;