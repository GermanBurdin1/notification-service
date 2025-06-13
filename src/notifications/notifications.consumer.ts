import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class NotificationsConsumer {
	constructor(private readonly service: NotificationsService) {
		console.log('📦 NotificationsConsumer создан');
	}

	@RabbitSubscribe({
		exchange: 'lesson_exchange',
		routingKey: 'lesson_created',
		queue: 'notifications',
	})
	async handleLessonCreated(data: any) {
		console.log('🔥 handleLessonCreated вызван:', data);
		console.log('🧪 this.service:', this.service);
		console.log('🧪 typeof this.service.create:', typeof this.service?.create);
		try {
			const saved = await this.service.create({
				recipient_id: data.user_id,
				sender_id: data.metadata?.studentId ?? null,
				type: data.type,
				title: data.title,
				message: data.message,
				data: data.metadata ?? {},
				status: data.status ?? 'unread',
			});

			console.log('✅ Уведомление сохранено в БД:', saved);
		} catch (error) {
			console.error('❌ Ошибка при сохранении уведомления:', error);
		}
	}

	@RabbitSubscribe({
		exchange: 'lesson_exchange',
		routingKey: 'lesson_response',
		queue: 'notifications',
	})
	async handleLessonResponse(data: any) {
		console.log('📩 [notifications] Получен ответ по уроку:', data);
		await this.service.create({
			recipient_id: data.user_id,
			sender_id: data.metadata?.teacherId ?? null,
			type: data.type,
			title: data.title,
			message: data.message,
			data: data.metadata,
			status: data.status,
		});
	}


}
