import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  console.log('🐇 notification-service запущен без connectMicroservice');
  await app.listen(process.env.PORT || 3003);
  console.log('✅ notification-service is running');
  console.log('🟢 HOT RELOAD TRIGGERED');
}
bootstrap();
