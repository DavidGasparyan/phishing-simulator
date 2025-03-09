import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

export class SocketIoAdapter extends IoAdapter {
  private readonly configService: ConfigService;

  constructor(app: INestApplication) {
    super(app);
    this.configService = app.get(ConfigService);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const corsOrigin = this.configService.get<string>('CORS_ORIGIN', '*');

    const optionsWithCors: ServerOptions = {
      ...options,
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/api/management/socket.io',
      serveClient: false,
      allowEIO3: true,
    };

    return super.createIOServer(port, optionsWithCors);
  }
}
