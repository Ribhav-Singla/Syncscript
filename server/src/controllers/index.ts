import { PrismaClient, } from '@prisma/client'
import { Request, Response } from "express";

const prisma = new PrismaClient()

export async function getMyDocuments(req: Request, res: Response) {
    let limit: number = Number(req.query.limit) || 5;
    if (limit > 5) {
        limit = 1e9;
    }
    try {
        const documents = await prisma.document.findMany({
            where: {
                userId: req.userId
            },
            take: limit,
            select: {
                documentId: true,
                filename: true,
                shareable: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.status(200).json(documents);

    } catch (error) {
        console.log('error occured while fetching the mydocuments: ', error);
        res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

export async function deleteMyDocument(req: Request, res: Response) {
    const { documentId } = req.params
    try {
        await prisma.document.delete({ where: { documentId, userId: req.userId } })
        res.status(200).json({ message: 'Document deleted successfully' })
    } catch (error) {
        console.log('error ocuured while deleteing my document: ', error);
        res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

export async function verifyDocumentId(req: Request, res: Response) {
    const { documentId } = req.params
    try {
        const document = await prisma.document.findUnique({ where: { documentId, shareable:true } })
        if (document) {
            res.status(200).json({ message: 'Document id is valid' })
        } else {
            res.status(404).json({ message: 'Document id is invalid' })
        }
    } catch (error) {
        console.log('error occured while verifying the dcoumentId: ', error);
        res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

export async function makeShareableDocument(req: Request, res: Response) {
    const { documentId } = req.params
    try {
        const document = await prisma.document.update({
            where: { documentId, userId: req.userId },
            data: {
                shareable: true
            }
        })
        res.status(200).json({ message: 'Document made shareable' })
    } catch (error) {
        console.log('error occured while making the document shareable: ', error);
        res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}

export async function makeNotShareableDocument(req: Request, res: Response) {
    const { documentId } = req.params
    try {
        const document = await prisma.document.update({
            where: { documentId, userId: req.userId },
            data: {
                shareable: false
            }
        })
        res.status(200).json({ message: 'Document made not shareable' })
    } catch (error) {
        console.log('error occured while making the document not shareable: ', error);
        res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}