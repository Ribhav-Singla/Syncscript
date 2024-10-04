import { Server } from "socket.io";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server as HttpServer } from 'http';


export default function intializeSocket(server: HttpServer) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    })

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token && socket.handshake.auth.token.split(' ')[1];
        if (!token) {
            return next(new Error("No token provided"))
        }

        try {
            const response = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
            if (!response) {
                return next(new Error("Invalid token"))
            }

            //@ts-ignore
            socket.userId = response.id
            next()
        } catch (error) {
            console.log('error occured while verify socket token: ', error);
            next(new Error("Invalid token"));
        }
    })

    io.on('connection',(socket)=>{
        console.log('new user connected');

        socket.on('send-changes', delta =>{
            socket.broadcast.emit('receive-changes', delta)
        })
        socket.on('disconnect',()=>{
            console.log('user disconnected');
        })
    })
}