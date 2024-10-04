"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggedIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function isLoggedIn(req, res, next) {
    const header = req.header('Authorization') || '';
    const token = header.split(' ')[1];
    try {
        const response = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (response.id) {
            req.userId = response.id;
            next();
        }
        else {
            res.status(401).json({ message: "Unauthorized" });
        }
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
}
exports.isLoggedIn = isLoggedIn;
