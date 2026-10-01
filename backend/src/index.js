import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' },
});

io.on('connection', (socket) => {
  socket.on('event:join', (eventId) => {
    if (typeof eventId === 'string') socket.join(`event:${eventId}`);
  });
});

const port = Number(process.env.PORT) || 4000;
httpServer.listen(port, () => {
  console.log(`Xtrack API listening on port ${port}`);
});