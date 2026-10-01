import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/error-handler.js';
import eventRoutes from './routes/event-routes.js';
import shareLinkRoutes from './routes/share-link-routes.js';
import shareRoutes from './routes/share-routes.js';
import chatRoutes from './routes/chat-routes.js';
import userRoutes from './routes/user-routes.js';
import { attachRealtime, setRealtimeServer } from './sockets/realtime.js';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });
const clientUrl = process.env.CLIENT_URL ?? process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.use(cors({ origin: clientUrl }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/events', eventRoutes);
app.use('/api/share-links', shareLinkRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

setRealtimeServer(attachRealtime(httpServer, clientUrl));

const port = Number(process.env.PORT) || 4000;

connectDatabase()
  .then(() => httpServer.listen(port, () => {
    console.log(`Xtrack API listening on port ${port}`);
  }))
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });

app.use(errorHandler);