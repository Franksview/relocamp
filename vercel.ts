import { routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: undefined,
  outputDirectory: 'public',
  framework: 'static',
};
