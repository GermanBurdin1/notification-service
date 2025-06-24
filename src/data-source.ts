import { DataSource } from 'typeorm';
import { Notification } from './notifications/notification.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost', 
  port: 5432,
  username: 'postgres',
  password: 'postgre',
  database: 'notifications_db',
  synchronize: false,
  logging: true,
  entities: [Notification],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
