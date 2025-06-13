import { Global, Module, Logger } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import * as dotenv from 'dotenv';
dotenv.config(); // 👈 добавь это здесь

const logger = new Logger('RabbitMqModule');

const RABBITMQ_URI = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
logger.log(`🐇 Подключение к RabbitMQ: ${RABBITMQ_URI}`);

@Global()
@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: RABBITMQ_URI,
      exchanges: [
        {
          name: process.env.RABBITMQ_EXCHANGE || 'lesson_exchange',
          type: 'direct',
        },
      ],
      enableControllerDiscovery: true,
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitMqModule {}
