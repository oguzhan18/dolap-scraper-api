import { createApp } from './main';
import type { NestExpressApplication } from '@nestjs/platform-express';

let cachedApp: NestExpressApplication | null = null;

export default async function handler(req: unknown, res: unknown): Promise<void> {
  if (!cachedApp) {
    cachedApp = await createApp();
    await cachedApp.init();
  }
  const expressApp = cachedApp.getHttpAdapter().getInstance();
  expressApp(req, res);
}
