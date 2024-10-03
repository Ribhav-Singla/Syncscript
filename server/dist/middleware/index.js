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
exports.isLoggedIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function isLoggedIn(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const header = req.header('Authorization') || '';
        const token = header.split(' ')[1];
        try {
            const response = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (response.id) {
                //@ts-ignore
                req.userId = response.id;
                next();
            }
            else {
                return res.status(401).json({ message: "Unauthorized" });
            }
        }
        catch (error) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    });
}
exports.isLoggedIn = isLoggedIn;
