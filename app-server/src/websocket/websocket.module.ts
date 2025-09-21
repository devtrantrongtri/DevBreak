import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActivityWebSocketGateway } from './websocket.gateway';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    ActivityLogsModule,
  ],
  providers: [ActivityWebSocketGateway],
  exports: [ActivityWebSocketGateway],
})
export class WebSocketModule {}
