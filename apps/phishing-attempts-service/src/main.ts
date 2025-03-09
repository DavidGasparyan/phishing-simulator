/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from './app/socket-io.adapter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Connect to RabbitMQ as a microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL', 'amqp://rabbit:rabbit@localhost:5672')],
      queue: 'phishing_events_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false, // Enable manual acknowledgement
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api/management');
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT', 3002);
  await app.listen(port);

  logger.log(`Management Server is running on http://localhost:${port}`);
  logger.log(`WebSocket server is available at path: /api/management/socket.io`);
}

bootstrap();
