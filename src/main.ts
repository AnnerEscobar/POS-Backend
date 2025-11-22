import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);/*  */
  app.enableCors({ origin: ['http://localhost:4200', 'https://pos-dem0.netlify.app'], credentials: true });
  /* app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); */
  await app.listen(process.env.PORT ?? 3000);
  /* await app.listen(3000, '0.0.0.0'); */
}
bootstrap();