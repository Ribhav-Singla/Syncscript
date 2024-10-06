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
const DEFAULT_FILENAME = 'Untitled document';

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
            socket.username = response.username
            next()
        } catch (error) {
            console.log('error occured while verify socket token: ', error);
            next(new Error("Invalid token"));
        }
    })

    io.on('connection', (socket: CustomSocket) => {
        console.log('new user connected: ', socket.username);

        socket.on('get-document', async documentId => {
            const document = await findOrCreateDocument(documentId, socket.userId);
            socket.join(documentId);
            socket.documentId = documentId;
            socket.emit('load-document', document?.data, document?.filename, document?.user.username);

            socket.on('send-changes', delta => {
                socket.broadcast.to(documentId).emit('receive-changes', delta)
            })

            socket.on('save-document', async (data, filename) => {
                await prisma.document.update({
                    where: {
                        documentId: documentId
                    },
                    data: {
                        data: data,
                        filename: filename || DEFAULT_FILENAME
                    }
                })
            })

            socket.on('send-toggleEditMode', data => {
                socket.broadcast.to(documentId).emit('load-toggleEditMode', data)
            })

            // emitting the list of online users within the same room
            const connectedSockets = io.sockets.adapter.rooms.get(documentId);
            if (connectedSockets) {
                //@ts-ignore
                const onlineUsers = Array.from(connectedSockets).map((socket) => { return io.sockets.sockets.get(socket).username })
                io.to(documentId).emit('load-onlineUsers', onlineUsers)
            }

        })

        socket.on('disconnect', () => {
            console.log('user disconnected');
            // emitting the list of online users within the same room
            const documentId = socket.documentId
            const connectedSockets = io.sockets.adapter.rooms.get(documentId);
            if (connectedSockets) {
                //@ts-ignore
                const onlineUsers = Array.from(connectedSockets).map((socket) => { return io.sockets.sockets.get(socket).username })
                io.to(documentId).emit('load-onlineUsers', onlineUsers)
            }
        })
    })
}

async function findOrCreateDocument(documentId: string, userId: string) {
    if (documentId == null) return
    const document = await prisma.document.findFirst({ where: { documentId: documentId }, include: { user: { select: { username: true } } } })
    if (!document) {
        return await prisma.document.create({
            data: {
                documentId,
                userId,
                data: DEFAULT_VALUE,
                filename: DEFAULT_FILENAME
            },
            include: {  
                user: {
                    select: {
                        username: true,  
                    },
                },
            },
        })
    } else {
        return document
    }
}