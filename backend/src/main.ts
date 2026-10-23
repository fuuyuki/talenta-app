import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Raw text body for the CSV import (`Content-Type: text/csv`).
  app.useBodyParser('text', {
    type: ['text/csv', 'text/plain'],
    limit: '5mb',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
