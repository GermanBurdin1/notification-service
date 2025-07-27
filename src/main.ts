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

  console.log('[NotificationService] Service démarré sans connectMicroservice');
  await app.listen(process.env.PORT || 3003);
  console.log('[NotificationService] Service en cours d\'exécution');
  console.log('[NotificationService] Hot reload déclenché');
  // TODO : ajouter un health check endpoint
}
bootstrap();
