import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectRepository(Notification)
		private notificationRepo: Repository<Notification>,
	) { }

	async create(data: Partial<Notification>) {
		console.log('📤 Попытка сохранить уведомление...');
		const notification = this.notificationRepo.create(data);
		console.log('🛠️ Создан объект уведомления:', notification);
		try {
			const saved = await this.notificationRepo.save(notification);
			console.log('💾 Сохранено в БД:', saved);
			return saved;
		} catch (err) {
			console.error('❌ Ошибка при сохранении в БД:', err);
			throw err;
		}
	}

	findByRecipient(recipient_id: string) {
		return this.notificationRepo.find({
			where: { recipient_id },
			order: { created_at: 'DESC' },
		});
	}

	updateStatus(id: string, status: string) {
		return this.notificationRepo.update(id, { status });
	}
}
