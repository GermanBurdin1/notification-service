import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Notification } from './notification.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectRepository(Notification)
		private notificationRepo: Repository<Notification>,
		private httpService: HttpService
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

	async findByLessonId(lessonId: string): Promise<Notification | undefined> {
		console.log('[NotificationsService] Поиск уведомления по lessonId:', lessonId);
		const notif = await this.notificationRepo.findOne({
			where: {
				type: 'booking_request',
				data: Raw(alias => `${alias} ->> 'lessonId' = '${lessonId}'`)
			}
		});
		console.log('[NotificationsService] Найдено уведомление:', notif);
		return notif;
	}

	async getNotificationByLessonId(lessonId: string): Promise<Notification | undefined> {
		const notifResp = await lastValueFrom(
			this.httpService.get(`http://localhost:3003/notifications/by-lesson/${lessonId}`)
		);
		return (notifResp as any).data as Notification;
	}

	async updateNotificationStatus(notification: Notification, accepted: boolean): Promise<void> {
		await lastValueFrom(
			this.httpService.patch(
				`http://localhost:3003/notifications/${notification.id}`,
				{ status: accepted ? 'accepted' : 'rejected' }
			)
		);
	}
}
