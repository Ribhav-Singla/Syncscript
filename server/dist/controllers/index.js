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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDocumentId = exports.deleteMyDocument = exports.getMyDocuments = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getMyDocuments(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let limit = Number(req.query.limit) || 5;
        if (limit > 5) {
            limit = 1e9;
        }
        try {
            const documents = yield prisma.document.findMany({
                where: {
                    userId: req.userId
                },
                take: limit,
                select: {
                    documentId: true,
                    filename: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });
            res.status(200).json(documents);
        }
        catch (error) {
            console.log('error occured while fetching the mydocuments: ', error);
            res.status(500).json({
                message: 'Internal Server Error',
            });
        }
    });
}
exports.getMyDocuments = getMyDocuments;
function deleteMyDocument(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { documentId } = req.params;
        try {
            yield prisma.document.delete({ where: { documentId, userId: req.userId } });
            res.status(200).json({ message: 'Document deleted successfully' });
        }
        catch (error) {
            console.log('error ocuured while deleteing my document: ', error);
            res.status(500).json({
                message: 'Internal Server Error',
            });
        }
    });
}
exports.deleteMyDocument = deleteMyDocument;
function verifyDocumentId(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { documentId } = req.params;
        try {
            const document = yield prisma.document.findUnique({ where: { documentId } });
            if (document) {
                res.status(200).json({ message: 'Document id is valid' });
            }
            else {
                res.status(404).json({ message: 'Document id is invalid' });
            }
        }
        catch (error) {
            console.log('error occured while verifying the dcoumentId: ', error);
            res.status(500).json({
                message: 'Internal Server Error',
            });
        }
    });
}
exports.verifyDocumentId = verifyDocumentId;
