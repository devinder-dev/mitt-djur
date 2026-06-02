// controllers/auth/refreshController.ts
// Handles POST /api/auth/refresh
// Job: read cookie → call service → set new cookie → send new access token

import type { FastifyRequest, FastifyReply } from 'fastify';
import * as authService from '../../services/authService.ts';
import { env } from '../../config/env.ts';

export const refreshController = async (request: FastifyRequest, reply: FastifyReply) => {

  // Step 1: Get the refresh token from the httpOnly cookie
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    return reply.status(401).send({
      success: false,
      message: 'No refresh token provided',
    });
  }

  // Step 2: Call the service to verify and get new tokens
  const data = await authService.refresh(request.server.db, refreshToken);

  // Step 3: Set the new refresh token cookie (token rotation)
  reply.setCookie('refreshToken', data.tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 60 * 60 * 24 * 7,
  });

  // Step 4: Send the new access token
  return reply.status(200).send({
    success: true,
    message: 'Tokens refreshed successfully',
    data: { accessToken: data.tokens.accessToken },
  });
};
