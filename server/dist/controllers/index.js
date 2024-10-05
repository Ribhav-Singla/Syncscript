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
exports.getMyDocuments = void 0;
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
