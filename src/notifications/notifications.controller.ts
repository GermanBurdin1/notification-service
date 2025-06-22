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
	updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
		return this.service.updateStatus(id, body.status);
	}

	@Get('by-lesson/:lessonId')
	async findByLessonId(@Param('lessonId') lessonId: string) {
		this.logger.log(`[NotificationsController] Поиск уведомления по lessonId: ${lessonId}`);
		return this.service.findByLessonId(lessonId);
	}
}
