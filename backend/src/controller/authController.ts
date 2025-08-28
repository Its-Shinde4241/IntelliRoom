import { Request, Response } from "express"
import { upsertUser } from "../services/user";


export const signup = async (req: Request, res: Response) => {
    const { uuid, name, email, password } = req.body;
    
}