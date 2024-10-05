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
            },
            orderBy:{
                updatedAt : 'desc'
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

export async function deleteMyDocument(req:Request, res:Response){   
    const { documentId } = req.params
    try {
        await prisma.document.delete({ where : { documentId, userId : req.userId}})
        res.status(200).json({message: 'Document deleted successfully'})
    } catch (error) {
        console.log('error ocuured while deleteing my document: ',error);
        res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}