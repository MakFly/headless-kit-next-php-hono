import { randomBytes } from 'node:crypto';

export function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
