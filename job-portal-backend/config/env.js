import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


// Adding these for easy access in other modules
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const CLIENT_URL = process.env.CLIENT_URL;