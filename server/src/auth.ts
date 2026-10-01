import type { RequestHandler } from 'express';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Verifying Firebase ID tokens needs only the project ID (Google's public signing keys are fetched
// automatically), so no service-account key is required. Falls back to the client's value in .env.
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

export const authEnabled = Boolean(projectId);
const auth = authEnabled ? getAuth(initializeApp({ projectId })) : null;

declare global {
  namespace Express {
    interface Request {
      uid?: string;
    }
  }
}

/** Requires `Authorization: Bearer <Firebase ID token>`. A no-op when Firebase isn't configured. */
export const requireUser: RequestHandler = async (req, res, next) => {
  if (!auth) return next();
  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Please sign in to use the workspace.' });
    return;
  }
  try {
    req.uid = (await auth.verifyIdToken(token)).uid;
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
};
