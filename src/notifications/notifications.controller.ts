import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Logger } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
	private readonly logger = new Logger(NotificationsController.name);
	constructor(private readonly service: NotificationsService) { }

	@Post()
	create(@Body() body: any) {
		return this.service.create(body);
	}

	@Get(':userId')
	findByRecipient(@Param('userId') userId: string) {
		this.logger.log(`📩 Запрос уведомлений для пользователя: ${userId}`);
		return this.service.findByRecipient(userId);
	}

	@Patch(':id')
	updateNotification(@Param('id') id: string, @Body() body: any) {
		// Если передан только status, используем старый метод для обратной совместимости
		if (body.status && Object.keys(body).length === 1) {
			return this.service.updateStatus(id, body.status);
		}
		// Иначе используем новый метод для обновления всех полей
		return this.service.updateNotification(id, body);
	}

	@Get('by-lesson/:lessonId')
	async findByLessonId(@Param('lessonId') lessonId: string) {
		this.logger.log(`[NotificationsController] Поиск уведомления по lessonId: ${lessonId}`);
		return this.service.findByLessonId(lessonId);
	}

	@Post('fix-missing-teacher-names')
	async fixMissingTeacherNames() {
		this.logger.log(`[NotificationsController] Исправление отсутствующих имен преподавателей`);
		return this.service.fixMissingTeacherNames();
	}
}
