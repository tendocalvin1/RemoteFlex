import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const CLIENT_URL = process.env.CLIENT_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;