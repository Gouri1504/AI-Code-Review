import type { RequestHandler } from 'express';

// Simple in-memory token bucket: 20 requests burst, refilling 20 per minute per user (or IP when signed out).
const CAPACITY = 20;
const REFILL_PER_SEC = 20 / 60;
const buckets = new Map<string, { tokens: number; last: number }>();

export const rateLimit: RequestHandler = (req, res, next) => {
  const key = req.uid ?? req.ip ?? 'unknown';
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: CAPACITY, last: now };
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + ((now - bucket.last) / 1000) * REFILL_PER_SEC);
  bucket.last = now;
  buckets.set(key, bucket);
  if (bucket.tokens < 1) {
    res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    return;
  }
  bucket.tokens -= 1;
  next();
};
