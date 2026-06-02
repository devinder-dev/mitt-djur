// utils/toObjectId.ts
// Safe ObjectId converter for URL parameters.
// Use this instead of `new ObjectId(id)` directly for any ID that comes from a URL param.
// If the string is not a valid 24-character hex ObjectId, throws AppError 400
// instead of letting MongoDB throw a raw BSONError that becomes a 500.

import { ObjectId } from 'mongodb';
import { AppError } from '../plugins/errorHandler.ts';

export function toObjectId(id: string): ObjectId {

  // Step 1: Check format — ObjectId must be exactly 24 hex characters
  if (!ObjectId.isValid(id) || id.length !== 24) {
    throw new AppError('Invalid ID format', 400);
  }

  // Step 2: Safe to construct now
  return new ObjectId(id);
}
