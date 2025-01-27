import crypto from 'crypto';

const salt = process.env.SECRET_KEY_NUMBER || '';

export function generateSecureTokenWithSalt(input: string): string {
    return crypto.createHash('sha256').update(input + salt).digest('hex');
}