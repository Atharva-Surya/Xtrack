import { Router } from 'express';
import { z } from 'zod';
import { chat } from '../controllers/chat-controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const chatSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(200),
    city: z.string().trim().max(100).default(''),
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

router.post('/', validate(chatSchema), chat);

export default router;