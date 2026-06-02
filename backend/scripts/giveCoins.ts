// scripts/giveCoins.ts
// Dev helper — adds coins to a user by email.
// Usage:  bun run scripts/giveCoins.ts <email> <amount>
// Example: bun run scripts/giveCoins.ts shabahdev@gmail.com 1000

import { MongoClient } from 'mongodb';
import { env } from '../src/config/env.ts';

const [email, amountArg] = process.argv.slice(2);

if (!email || !amountArg) {
  console.error('Usage: bun run scripts/giveCoins.ts <email> <amount>');
  process.exit(1);
}

// Validate email format — prevents NoSQL injection via unsanitized CLI input
const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
if (!emailRegex.test(email)) {
  console.error('Invalid email format');
  process.exit(1);
}

const amount = Number(amountArg);
if (!Number.isFinite(amount)) {
  console.error('Amount must be a number');
  process.exit(1);
}

const client = new MongoClient(env.MONGODB_URI);

try {
  await client.connect();
  const db = client.db();

  const result = await db.collection('users').findOneAndUpdate(
    { email },
    { $inc: { coins: amount } },
    { returnDocument: 'after' },
  );

  if (!result) {
    console.error(`No user found for email: ${email}`);
    process.exit(1);
  }

  console.log(`✅ ${email} now has ${result.coins} coins (added ${amount})`);
} finally {
  await client.close();
}
