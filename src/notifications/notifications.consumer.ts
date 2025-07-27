import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class NotificationsConsumer {
	constructor(private readonly service: NotificationsService) {
		console.log('[NotificationsConsumer] Consumer créé');
	}

	@RabbitSubscribe({
		exchange: 'lesson_exchange',
		routingKey: 'lesson_created',
		queue: 'notifications',
	})
	async handleLessonCreated(data: any) {
		console.log('[NotificationsConsumer] handleLessonCreated appelé:', data);
		console.log('[NotificationsConsumer] this.service:', this.service);
		console.log('[NotificationsConsumer] typeof this.service.create:', typeof this.service?.create);
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

			console.log('[NotificationsConsumer] Notification sauvegardée en BDD:', saved);
		} catch (error) {
			console.error('[NotificationsConsumer] Erreur lors de la sauvegarde notification:', error);
		}
	}

	@RabbitSubscribe({
		exchange: 'lesson_exchange',
		routingKey: 'lesson_response',
		queue: 'notifications',
	})
	async handleLessonResponse(data: any) {
		console.log('[NotificationsConsumer] Réponse de cours reçue:', data);
		// TODO : valider les données avant sauvegarde
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
