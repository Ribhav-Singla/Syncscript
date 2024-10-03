import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

interface JwtPayload {
    id: string;
}

export async function isLoggedIn(req:Request, res:Response, next:NextFunction){
    const header = req.header('Authorization') || ''
    const token = header.split(' ')[1]
    try {
        const response = jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload
        if(response.id){
            //@ts-ignore
            req.userId = response.id
            next()
        }else{
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
    
