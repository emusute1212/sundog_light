import type { NextApiRequest, NextApiResponse } from 'next';
import cors from 'cors';

import type { Socket as NetSocket } from 'net';
import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

type ResponseWebSocket = NextApiResponse & {
    socket: NetSocket & { server: HttpServer & { io?: SocketServer } };
};

const corsMiddleware = cors();

export default function SocketHandler(req: NextApiRequest, res: ResponseWebSocket) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    if (res.socket.server.io) {
        return res.send('already-set-up');
    }
    const io = new SocketServer(res.socket.server, {
        addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
        const clientId = socket.id;
        console.log(`A client connected. ID: ${clientId}`);

        socket.on('selected_color', (data) => {
            io.emit('selected_color', data);
            console.log('Received selected_color and broadcast:', data);
        });

        socket.on('disconnect', () => {
            console.log('A client disconnected.');
        });
    });

    // CORS settings
    corsMiddleware(req, res, () => {
        res.socket.server.io = io;
        res.end();
    });
}
