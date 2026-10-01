import { Router } from 'express';
import { z } from 'zod';
import { openLink } from '../controllers/share-link-controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const linkSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ token: z.string().regex(/^[a-f0-9]{32}$/) }),
  query: z.object({ userId: z.string().uuid() }),
});

router.get('/:token', validate(linkSchema), openLink);

export default router;