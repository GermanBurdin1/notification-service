// Полифилл для crypto в Node.js 18
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notifications/notification.entity';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsConsumer } from './notifications/notifications.consumer';
import { RabbitMqModule } from './rabbitmq.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Notification],
			migrations: ['dist/migrations/*.js'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Notification]), 
    RabbitMqModule, 
    HttpModule
  ],
	controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsConsumer],
})
export class AppModule {}
