import express from 'express'
import { Request, Response } from 'express'
import { PrismaClient,Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { isLoggedIn } from '../middleware'

export const authRouter = express.Router();
const prisma = new PrismaClient();
const salt = bcrypt.genSaltSync(10);

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findFirst({ where: { username } })
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                const token = jwt.sign({ id: user.id, username: username }, process.env.JWT_SECRET as string)
                res.status(200).json({ token })
            } else {
                res.status(401).json({ message: "Invalid password" })
            }
        } else {
            res.status(401).json({ message: 'User not found!' })
        }
    } catch (error) {
        console.log('error occured in authRouter /login: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

authRouter.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET as string)
        res.status(200).json({ token })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(400).json({ message: 'Username already exists. Please choose another one.' });
        } else {
            console.log('Error occurred in authRouter /register:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
})

authRouter.get('/me', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } })
        res.status(200).json({ username : user?.username})
    } catch (error) {
        console.log('Error occurred in authRouter /me:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});