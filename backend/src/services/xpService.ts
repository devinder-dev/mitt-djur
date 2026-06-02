// services/xpService.ts
// Pure XP logic — no database, no HTTP.
// Calculates XP from steps, handles level ups and stage changes.
// Used by any feature that awards XP (steps, activities, missions).

import type { PetStage } from '../models/petModel.ts';

// ─── Constants ────────────────────────────────────────────────────────────────

// How many XP per 1000 steps
const XP_PER_1000_STEPS = 10;

// XP required to reach each level — index = level
// e.g. to reach level 1 you need 100 XP, level 2 needs 250 XP total
const LEVEL_THRESHOLDS: number[] = [
  0,    // level 0 — starting point (egg)
  100,  // level 1 — chick
  250,  // level 2
  450,  // level 3 — small_bird
  700,  // level 4
  1000, // level 5 — bird
  1350, // level 6
  1750, // level 7
  2200, // level 8 — parrot
  2700, // level 9
  3250, // level 10
  3850, // level 11
  4500, // level 12 — eagle
  5200, // level 13
  5950, // level 14
  6750, // level 15
  7600, // level 16
  8500, // level 17 — dragon
];

// Which level triggers a stage change
const STAGE_BY_LEVEL: Record<number, PetStage> = {
  0:  'egg',
  1:  'chick',
  3:  'small_bird',
  5:  'bird',
  8:  'parrot',
  12: 'eagle',
  17: 'dragon',
};

// ─── XP from Steps ────────────────────────────────────────────────────────────

// Calculates how much XP a given step count earns
export const calculateXpFromSteps = (steps: number): number => {
  return Math.floor(steps / 1000) * XP_PER_1000_STEPS;
};

// ─── Level Calculator ─────────────────────────────────────────────────────────

// Given total XP, returns what level the pet should be at
export const calculateLevel = (totalXp: number): number => {
  let level = 0;

  // Step 1: Walk through thresholds and find the highest level reached
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]!) {
      level = i;
    } else {
      break;
    }
  }

  return level;
};

// ─── Stage Calculator ─────────────────────────────────────────────────────────

// Given a level, returns the correct pet stage
export const calculateStage = (level: number): PetStage => {

  // Step 1: Find the highest stage threshold the level has passed
  let stage: PetStage = 'egg';

  for (const [thresholdLevel, thresholdStage] of Object.entries(STAGE_BY_LEVEL)) {
    if (level >= Number(thresholdLevel)) {
      stage = thresholdStage;
    }
  }

  return stage;
};

// ─── Apply XP ─────────────────────────────────────────────────────────────────

// Main function — takes current pet state + new XP, returns updated values
// Returns the new xp, level and stage so the caller can save them
export const applyXp = (
  currentXp: number,
  currentLevel: number,
  xpToAdd: number,
): { newXp: number; newLevel: number; newStage: PetStage; leveledUp: boolean } => {

  // Step 1: Add the new XP to existing XP
  const newXp = currentXp + xpToAdd;

  // Step 2: Recalculate level from total XP
  const newLevel = calculateLevel(newXp);

  // Step 3: Recalculate stage from new level
  const newStage = calculateStage(newLevel);

  // Step 4: Check if a level up happened
  const leveledUp = newLevel > currentLevel;

  return { newXp, newLevel, newStage, leveledUp };
};
