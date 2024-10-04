import { Server } from "socket.io";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server as HttpServer } from 'http';
import { PrismaClient, Prisma } from '@prisma/client'
import { Socket as SocketIO } from "socket.io";

interface CustomSocket extends SocketIO {
    userId: string;
}

const prisma = new PrismaClient();
const DEFAULT_VALUE = '';

export default function intializeSocket(server: HttpServer) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    })

    io.use(async (socket: CustomSocket, next) => {
        const token = socket.handshake.auth.token && socket.handshake.auth.token.split(' ')[1];
        if (!token) {
            return next(new Error("No token provided"))
        }

        try {
            const response = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
            if (!response) {
                return next(new Error("Invalid token"))
            }
            socket.userId = response.id
            next()
        } catch (error) {
            console.log('error occured while verify socket token: ', error);
            next(new Error("Invalid token"));
        }
    })

    io.on('connection', (socket: CustomSocket) => {
        console.log('new user connected');

        socket.on('get-document', async documentId => {
            const document = await findOrCreateDocument(documentId, socket.userId);
            socket.join(documentId);
            socket.emit('load-document', document?.data);

            socket.on('send-changes', delta => {
                socket.broadcast.to(documentId).emit('receive-changes', delta)
            })

            socket.on('save-document', async data => {
                await prisma.document.update({
                    where: {
                        documentId : documentId
                    },
                    data: {
                        data: data
                    }
                })
            })
        })

        socket.on('disconnect', () => {
            console.log('user disconnected');
        })
    })
}

async function findOrCreateDocument(documentId: string, userId: string) {
    if (documentId == null) return
    const document = await prisma.document.findFirst({ where: { documentId: documentId } })
    if (!document) {
        return await prisma.document.create({
            data: {
                documentId,
                userId,
                data: DEFAULT_VALUE
            }
        })
    } else {
        return document
    }
}