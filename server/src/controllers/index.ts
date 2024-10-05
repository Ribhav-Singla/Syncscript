import { PrismaClient,} from '@prisma/client'
import { Request, Response } from "express";

const prisma = new PrismaClient()

export async function getMyDocuments(req:Request,res:Response){
    let limit: number = Number(req.query.limit) || 5;
    if(limit > 5){
        limit = 1e9;
    }
    try {
        const documents = await prisma.document.findMany({
            where:{
                userId: req.userId
            },
            take : limit,
            select:{
                documentId : true,
                filename : true,
                createdAt : true,
                updatedAt : true,
            }
        });

        res.status(200).json(documents);

    } catch (error) {
        console.log('error occured while fetching the mydocuments: ',error);
        res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}