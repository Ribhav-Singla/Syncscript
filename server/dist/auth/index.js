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
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const middleware_1 = require("../middleware");
exports.authRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const salt = bcryptjs_1.default.genSaltSync(10);
exports.authRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield prisma.user.findFirst({ where: { username } });
        if (user) {
            if (bcryptjs_1.default.compareSync(password, user.password)) {
                const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
                res.status(200).json({ token });
            }
            else {
                res.status(401).json({ message: "Invalid password" });
            }
        }
        else {
            res.status(401).json({ message: 'User not found!' });
        }
    }
    catch (error) {
        console.log('error occured in authRouter /login: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.authRouter.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const hashedPassword = bcryptjs_1.default.hashSync(password, salt);
        const user = yield prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET);
        res.status(200).json({ token });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(400).json({ message: 'Username already exists. Please choose another one.' });
        }
        else {
            console.log('Error occurred in authRouter /register:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));
exports.authRouter.get('/me', middleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({ where: { id: req.userId } });
        res.status(200).json({ username: user === null || user === void 0 ? void 0 : user.username });
    }
    catch (error) {
        console.log('Error occurred in authRouter /me:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
