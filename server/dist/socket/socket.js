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
            next();
        }
        catch (error) {
            console.log('error occured while verify socket token: ', error);
            next(new Error("Invalid token"));
        }
    }));
    io.on('connection', (socket) => {
        console.log('new user connected');
        socket.on('get-document', (documentId) => __awaiter(this, void 0, void 0, function* () {
            const document = yield findOrCreateDocument(documentId, socket.userId);
            socket.join(documentId);
            socket.emit('load-document', document === null || document === void 0 ? void 0 : document.data);
            socket.on('send-changes', delta => {
                socket.broadcast.to(documentId).emit('receive-changes', delta);
            });
            socket.on('save-document', (data) => __awaiter(this, void 0, void 0, function* () {
                yield prisma.document.update({
                    where: {
                        documentId: documentId
                    },
                    data: {
                        data: data
                    }
                });
            }));
        }));
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}
exports.default = intializeSocket;
function findOrCreateDocument(documentId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (documentId == null)
            return;
        const document = yield prisma.document.findFirst({ where: { documentId: documentId } });
        if (!document) {
            return yield prisma.document.create({
                data: {
                    documentId,
                    userId,
                    data: DEFAULT_VALUE
                }
            });
        }
        else {
            return document;
        }
    });
}
