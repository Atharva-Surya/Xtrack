import { Router } from 'express';
import { z } from 'zod';
import { readProfile, updateProfile } from '../controllers/user-controller.js';
import { createRsvp, deleteRsvp, listRsvps } from '../controllers/rsvp-controller.js';
import { listUserReminders, updateReminder } from '../controllers/reminder-controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const userId = z.string().uuid();
const eventId = z.string().trim().min(1).max(200);
const eventDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
}, 'Enter a valid event date');
const empty = z.object({}).optional();
const userParams = z.object({ userId });
const eventParams = z.object({ userId, eventId });

const profileSchema = z.object({
  body: z.object({
    displayName: z.string().trim().max(80).optional(),
    email: z.string().trim().max(254).email().or(z.literal('')).optional(),
    city: z.string().trim().max(100).optional(),
    region: z.string().trim().max(100).optional(),
  }).strict().refine((profile) => Object.keys(profile).length > 0, 'Provide at least one profile field'),
  params: userParams,
  query: empty,
});

const userSchema = z.object({ body: empty, params: userParams, query: empty });
const eventPathSchema = z.object({ body: empty, params: eventParams, query: empty });
const rsvpSchema = z.object({
  body: z.object({
    eventId,
    title: z.string().trim().min(1).max(200),
    venue: z.string().trim().min(1).max(200),
    date: eventDate,
    time: z.string().trim().min(1).max(50),
  }).strict(),
  params: userParams,
  query: empty,
});
const reminderSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
    minutesBefore: z.number().int().min(5).max(10080),
  }).strict(),
  params: eventParams,
  query: empty,
});

router.get('/:userId', validate(userSchema), readProfile);
router.put('/:userId', validate(profileSchema), updateProfile);
router.get('/:userId/rsvps', validate(userSchema), listRsvps);
router.post('/:userId/rsvps', validate(rsvpSchema), createRsvp);
router.delete('/:userId/rsvps/:eventId', validate(eventPathSchema), deleteRsvp);
router.get('/:userId/reminders', validate(userSchema), listUserReminders);
router.put('/:userId/reminders/:eventId', validate(reminderSchema), updateReminder);

export default router;