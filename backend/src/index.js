import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/error-handler.js';
import eventRoutes from './routes/event-routes.js';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/events', eventRoutes);

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

app.use(errorHandler);