import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseFormatInterceptor } from './modules/shared/interceptors/response-format.interceptor';
import { GlobalExceptionFilter } from './modules/shared/exceptions/global-exception.filter';
// import { setDefaultResultOrder } from 'node:dns';
// setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:3000'
  ).split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix('api/v1');

  // Catch everything — domain exceptions, ORM errors, unexpected errors
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Validate all incoming request DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true, // auto-transform payloads to DTO instances
    }),
  );

  // Uniform response envelope: { success, data, error }
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  const appPort = process.env.PORT ?? 3001;
  console.log(`🚀 Application is running on port: ${appPort}`);
  await app.listen(appPort, '0.0.0.0');
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
