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
		this.logger.log(`[NotificationsController] Demande de notifications pour utilisateur: ${userId}`);
		return this.service.findByRecipient(userId);
	}

	@Patch(':id')
	updateNotification(@Param('id') id: string, @Body() body: any) {
		// si seulement status est passé, on utilise l'ancienne méthode pour la rétrocompatibilité
		if (body.status && Object.keys(body).length === 1) {
			return this.service.updateStatus(id, body.status);
		}
		// sinon on utilise la nouvelle méthode pour mettre à jour tous les champs
		return this.service.updateNotification(id, body);
	}

	@Get('by-lesson/:lessonId')
	async findByLessonId(@Param('lessonId') lessonId: string) {
		this.logger.log(`[NotificationsController] Recherche notification par lessonId: ${lessonId}`);
		return this.service.findByLessonId(lessonId);
	}

	@Post('fix-missing-teacher-names')
	async fixMissingTeacherNames() {
		this.logger.log(`[NotificationsController] Correction des noms de prof manquants`);
		// TODO : ajouter une protection par authentification admin
		return this.service.fixMissingTeacherNames();
	}

	@Patch(':id/hide')
	async hideNotificationForUser(@Param('id') id: string) {
		this.logger.log(`[NotificationsController] Masquage notification ${id} pour utilisateur`);
		return this.service.hideNotificationForStudent(id);
	}
}
