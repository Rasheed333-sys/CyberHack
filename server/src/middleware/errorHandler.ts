import type { Request, Response, NextFunction } from 'express';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found.' } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  if (err?.message === 'Not allowed by CORS') {
    res.status(403).json({ error: { code: 'CORS_FORBIDDEN', message: 'This origin is not allowed to access the API.' } });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' } });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
    return;
  }

  // Log only the error message for diagnostics — never request bodies
  // (which may contain user conversation content) and never secrets.
  // eslint-disable-next-line no-console
  console.error('[cyberhack-api] Unhandled error:', err?.message ?? 'Unknown error');

  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our end.' } });
}