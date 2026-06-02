// utils/validate.ts
// Generic Zod validation helper.
// Takes any Zod schema and data, returns the validated result.
// If validation fails, throws a ValidationError that the errorHandler plugin catches.

import { z, ZodError } from 'zod';

// Step 1: Custom validation error with clean field-by-field details
export class ValidationError extends Error {
  public details: Record<string, string[]>;

  constructor(error: ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.details = error.flatten().fieldErrors as Record<string, string[]>;
  }
}

// Step 2: Validate data against a schema — returns typed result or throws
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error);
  }

  return result.data;
}
