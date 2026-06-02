// types/achievementTypes.ts
// TypeScript types for achievement response bodies.

// Response type — one earned achievement
export type AchievementItem = {
  id: string;
  title: string;
  description: string;
  earnedAt: Date;
};
