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
			where: { 
				recipient_id,
				hidden_by_user: false  // показываем только не скрытые уведомления
			},
			order: { created_at: 'DESC' },
		});
	}

	updateStatus(id: string, status: string) {
		return this.notificationRepo.update(id, { status });
	}

	updateNotification(id: string, updateData: Partial<Notification>) {
		return this.notificationRepo.update(id, updateData);
	}

	async hideNotificationForStudent(id: string) {
		return this.notificationRepo.update(id, { hidden_by_user: true });
	}

	async findByLessonId(lessonId: string): Promise<Notification | undefined> {
		console.log('[NotificationsService] Поиск уведомления по lessonId:', lessonId);
		// Ищем уведомления типа booking_proposal (предложения от преподавателя)
		let notif = await this.notificationRepo.findOne({
			where: {
				type: 'booking_proposal',
				data: Raw(alias => `${alias} ->> 'lessonId' = '${lessonId}'`)
			}
		});
		
		// Если не найдено booking_proposal, ищем booking_request
		if (!notif) {
			notif = await this.notificationRepo.findOne({
				where: {
					type: 'booking_request',
					data: Raw(alias => `${alias} ->> 'lessonId' = '${lessonId}'`)
				}
			});
		}
		
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

	async fixMissingTeacherNames(): Promise<any> {
		console.log('[NotificationsService] Начинаем исправление отсутствующих имен преподавателей');
		
		// Находим все уведомления типа booking_proposal без teacherName
		const notifications = await this.notificationRepo.find({
			where: { type: 'booking_proposal' }
		});

		console.log(`[NotificationsService] Найдено ${notifications.length} уведомлений типа booking_proposal`);
		
		let updatedCount = 0;
		
		for (const notification of notifications) {
			try {
				// Проверяем, есть ли уже teacherName
				if (notification.data?.teacherName) {
					console.log(`[NotificationsService] Уведомление ${notification.id} уже содержит teacherName`);
					continue;
				}

				// Получаем lessonId
				const lessonId = notification.data?.lessonId;
				if (!lessonId) {
					console.log(`[NotificationsService] Уведомление ${notification.id} не содержит lessonId`);
					continue;
				}

				// Получаем информацию об уроке
				const lessonResp = await lastValueFrom(
					this.httpService.get(`http://localhost:3004/lessons/${lessonId}`)
				);
				
				const lesson = lessonResp.data;
				if (!lesson || !lesson.teacherName) {
					console.log(`[NotificationsService] Не удалось получить информацию о преподавателе для урока ${lessonId}`);
					continue;
				}

				// Обновляем data уведомления
				const updatedData = {
					...notification.data,
					teacherId: lesson.teacherId,
					teacherName: lesson.teacherName
				};

				await this.notificationRepo.update(notification.id, {
					data: updatedData
				});

				console.log(`[NotificationsService] Обновлено уведомление ${notification.id} с teacherName: ${lesson.teacherName}`);
				updatedCount++;

			} catch (error) {
				console.error(`[NotificationsService] Ошибка при обновлении уведомления ${notification.id}:`, error);
			}
		}

		console.log(`[NotificationsService] Обновлено ${updatedCount} уведомлений`);
		return { success: true, updatedCount };
	}
}
