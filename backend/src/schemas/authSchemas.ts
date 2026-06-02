// schemas/authSchemas.ts
// Zod validation schemas for all auth-related request bodies.
// These run at RUNTIME to validate incoming data before it reaches the service layer.
// Each schema defines the rules: required fields, min lengths, formats, etc.

import { z } from 'zod';

// POST /api/auth/register
export const registerSchema = z.object({
  email: z
    .email('Email must be a valid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

// POST /api/auth/login
export const loginSchema = z.object({
  email: z
    .email('Email must be a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});
