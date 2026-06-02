// controllers/auth/registerController.ts
// Handles POST /api/auth/register
// Job: validate → call service → set refresh cookie → send access token

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { registerSchema } from '../../schemas/authSchemas.ts';
import * as authService from '../../services/authService.ts';
import { env } from '../../config/env.ts';

export const registerController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(registerSchema, request.body);

  // Step 2: Call the service
  const { tokens } = await authService.register(request.server.db, body);

  // Step 3: Set the refresh token as an httpOnly cookie (never exposed to JS)
  reply.setCookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 60 * 60 * 24 * 7,
  });

  // Step 4: Return only the access token in the response body
  return reply.status(201).send({
    success: true,
    message: 'User registered successfully',
    data: { accessToken: tokens.accessToken },
  });
};
