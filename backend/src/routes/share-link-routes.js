import { Router } from 'express';
import { z } from 'zod';
import { createLink } from '../controllers/share-link-controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const createSchema = z.object({
  body: z.object({ userId: z.string().uuid(), eventId: z.string().trim().min(1).max(200) }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

router.post('/', validate(createSchema), createLink);

export default router;