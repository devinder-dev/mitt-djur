// routes/activity/index.ts
// Route file for all activity endpoints.
// This file ONLY maps URLs to controllers — no logic here.
// Prefix: /api/activity (set in server.ts)

import type { FastifyInstance } from 'fastify';
import { syncStepsController } from '../../controllers/activity/syncStepsController.ts';
import { getTodayController } from '../../controllers/activity/getTodayController.ts';
import { logActivityController } from '../../controllers/activity/logActivityController.ts';
import { setMoodController } from '../../controllers/activity/setMoodController.ts';
import { addGratitudeController } from '../../controllers/activity/addGratitudeController.ts';
import { addNoteController } from '../../controllers/activity/addNoteController.ts';
import { getActivityHistoryController } from '../../controllers/activity/getActivityHistoryController.ts';

export default async function activityRoutes(server: FastifyInstance): Promise<void> {

  // GET /api/activity/today — return today's activity log (protected)
  server.get('/today', { preHandler: server.authenticate }, getTodayController);

  // GET /api/activity/history — last 60 days of full activity logs (protected)
  server.get('/history', { preHandler: server.authenticate }, getActivityHistoryController);

  // POST /api/activity/note — set the daily journal note, overwrites existing (protected)
  server.post('/note', { preHandler: server.authenticate }, addNoteController);

  // POST /api/activity/gratitude — add a gratitude entry, earn XP, bonus on 3rd (protected)
  server.post('/gratitude', { preHandler: server.authenticate }, addGratitudeController);

  // POST /api/activity/log — log an activity type, earn XP (protected)
  server.post('/log', { preHandler: server.authenticate }, logActivityController);

  // POST /api/activity/mood — set today's mood check-in, earn XP, locks after (protected)
  server.post('/mood', { preHandler: server.authenticate }, setMoodController);

  // POST /api/activity/steps — sync steps, earn XP, update pet (protected)
  server.post('/steps', { preHandler: server.authenticate }, syncStepsController);
}
