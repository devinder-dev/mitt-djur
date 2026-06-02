// jobs/healthDecay.ts
// Cron job that runs every day at 00:05 Stockholm time.
// Handles health decay, pet mood updates, and the 3-strike death system.
// All updates are bulk MongoDB operations — no per-pet loops.

import type { Db } from 'mongodb';
import cron from 'node-cron';
import { setActivePetsMoodHappy, decayHealthNormal, warnPets, killPets } from '../repositories/petRepository.ts';

const HEALTH_DECAY_AMOUNT = 20;

export function startHealthDecayJob(db: Db): void {

  cron.schedule('5 0 * * *', async () => {

    console.log('⏰ Health decay job started');

    try {
      const today = new Date().toISOString().substring(0, 10);

      // Step 1: Set mood to happy for all pets that were active today
      await setActivePetsMoodHappy(db, today);

      // Step 2: Reduce health for inactive pets that won't hit 0
      const decayed = await decayHealthNormal(db, today, HEALTH_DECAY_AMOUNT);

      // Step 3: Warn pets whose health hits 0 (1st or 2nd time) — reset to 1, increment counter
      const warned = await warnPets(db, today, HEALTH_DECAY_AMOUNT);

      // Step 4: Kill pets whose health hits 0 for the 3rd time
      const killed = await killPets(db, today, HEALTH_DECAY_AMOUNT);

      console.log(`✅ Health decay done — decayed: ${decayed}, warned: ${warned}, died: ${killed}`);

    } catch (error) {
      console.error('❌ Health decay job failed:', error);
    }

  }, { timezone: 'Europe/Stockholm' });

  console.log('🕐 Health decay job scheduled — runs daily at 00:05 Stockholm time');
}
