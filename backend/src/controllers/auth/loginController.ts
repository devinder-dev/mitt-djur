// controllers/auth/loginController.ts
// Handles POST /api/auth/login
// Job: validate → call service → set cookie → send response

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validate.ts';
import { loginSchema } from '../../schemas/authSchemas.ts';
import * as authService from '../../services/authService.ts';
import { env } from '../../config/env.ts';

export const loginController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Validate the request body
  const body = validate(loginSchema, request.body);

  // Step 2: Call the service
  const data = await authService.login(request.server.db, body);

  // Step 3: Set the refresh token as an httpOnly cookie
  reply.setCookie('refreshToken', data.tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 60 * 60 * 24 * 7,
  });

  // Step 4: Send the access token back (refresh token is in the cookie)
  return reply.status(200).send({
    success: true,
    message: 'Login successful',
    data: { accessToken: data.tokens.accessToken },
  });
};
