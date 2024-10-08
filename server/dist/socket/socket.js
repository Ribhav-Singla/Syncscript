"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const DEFAULT_VALUE = '';
const DEFAULT_FILENAME = 'Untitled document';
function intializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
        }
    });
    io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
        const token = socket.handshake.auth.token && socket.handshake.auth.token.split(' ')[1];
        if (!token) {
            return next(new Error("No token provided"));
        }
        try {
            const response = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!response) {
                return next(new Error("Invalid token"));
            }
            socket.userId = response.id;
            socket.username = response.username;
            next();
        }
        catch (error) {
            console.log('error occured while verify socket token: ', error);
            next(new Error("Invalid token"));
        }
    }));
    io.on('connection', (socket) => {
        console.log('new user connected: ', socket.username);
        socket.on('get-document', (documentId) => __awaiter(this, void 0, void 0, function* () {
            const document = yield findOrCreateDocument(documentId, socket.userId);
            socket.join(documentId);
            socket.documentId = documentId;
            socket.emit('load-document', document === null || document === void 0 ? void 0 : document.data, document === null || document === void 0 ? void 0 : document.filename, document === null || document === void 0 ? void 0 : document.editMode, document === null || document === void 0 ? void 0 : document.user.username);
            socket.on('send-changes', delta => {
                socket.broadcast.to(documentId).emit('receive-changes', delta);
            });
            socket.on('save-document', (data, filename) => __awaiter(this, void 0, void 0, function* () {
                yield prisma.document.update({
                    where: {
                        documentId: documentId
                    },
                    data: {
                        data: data,
                        filename: filename || DEFAULT_FILENAME
                    }
                });
            }));
            socket.on('send-toggleEditMode', () => __awaiter(this, void 0, void 0, function* () {
                const updatedDocument = yield updateEditMode(documentId, socket.userId);
                socket.broadcast.to(documentId).emit('load-toggleEditMode', updatedDocument === null || updatedDocument === void 0 ? void 0 : updatedDocument.editMode);
            }));
            socket.on("close-document", (documentId) => {
                socket.broadcast.to(documentId).emit("close-document");
            });
            // emitting the list of online users within the same room
            const connectedSockets = io.sockets.adapter.rooms.get(documentId);
            if (connectedSockets) {
                //@ts-ignore
                const onlineUsers = Array.from(connectedSockets).map((socket) => { return io.sockets.sockets.get(socket).username; });
                io.to(documentId).emit('load-onlineUsers', onlineUsers);
            }
        }));
        socket.on('disconnect', () => {
            console.log('user disconnected');
            // emitting the list of online users within the same room
            const documentId = socket.documentId;
            const connectedSockets = io.sockets.adapter.rooms.get(documentId);
            if (connectedSockets) {
                //@ts-ignore
                const onlineUsers = Array.from(connectedSockets).map((socket) => { return io.sockets.sockets.get(socket).username; });
                io.to(documentId).emit('load-onlineUsers', onlineUsers);
            }
        });
    });
}
exports.default = intializeSocket;
function findOrCreateDocument(documentId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (documentId == null)
            return;
        const document = yield prisma.document.findFirst({ where: { documentId: documentId }, include: { user: { select: { username: true } } } });
        if (!document) {
            return yield prisma.document.create({
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
            });
        }
        else {
            return document;
        }
    });
}
function updateEditMode(documentId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (documentId == null)
            return;
        try {
            const document = yield prisma.document.findUnique({
                where: {
                    documentId: documentId,
                    userId: userId
                }
            });
            if (!document) {
                return;
            }
            const updatedDocument = yield prisma.document.update({
                where: {
                    documentId: documentId,
                    userId: userId
                },
                data: {
                    editMode: !document.editMode
                }
            });
            return updatedDocument;
        }
        catch (error) {
            console.log('error occured while updating editMode: ', error);
        }
    });
}
