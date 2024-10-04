import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { authRouter } from './auth';
import cors from 'cors';
import { createServer } from 'http';
import intializeSocket from './socket/socket';
dotenv.config();

const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: '*', 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true, 
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

app.use('/auth',authRouter)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
