import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const protect = (req, res, next) => {
  const headerToken = req.headers.authorization?.split(' ')[1];
  const cookieToken = req.cookies?.accessToken;
  const token = headerToken || cookieToken;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};