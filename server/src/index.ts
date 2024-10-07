import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { authRouter } from './auth';
import cors from 'cors';
import { createServer } from 'http';
import intializeSocket from './socket/socket';
import { isLoggedIn } from './middleware';
import { deleteMyDocument, getMyDocuments, makeNotShareableDocument, makeShareableDocument, verifyDocumentId } from './controllers';
dotenv.config();

const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: '*', // For testing purposes, allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Only needed if you're sending cookies or credentials
};

const app = express();
app.use(cors(corsOptions))
const server = createServer(app)
intializeSocket(server)

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Healthy server!',
    })
});

app.use('/auth', authRouter)
app.get('/mydocuments', isLoggedIn, getMyDocuments);
app.post('/deleteDocument/:documentId', isLoggedIn, deleteMyDocument);
app.get('/verifyDocumentId/:documentId', isLoggedIn, verifyDocumentId);
app.post('/makeShareableDocument/:documentId', isLoggedIn, makeShareableDocument);
app.post('/makeNotShareableDocument/:documentId', isLoggedIn, makeNotShareableDocument);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
