import { Router } from 'express';
import { z } from 'zod';
import { listEvents } from '../controllers/event-controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const eventDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
}, 'Enter a valid event date');
const querySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    city: z.string().trim().min(2).max(100),
    keyword: z.string().trim().max(100).optional(),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
    date: eventDate.optional(),
    page: z.coerce.number().int().min(0).default(0),
    size: z.coerce.number().int().min(1).max(200).default(100),
  }),
});

router.get('/', validate(querySchema), listEvents);

export default router;