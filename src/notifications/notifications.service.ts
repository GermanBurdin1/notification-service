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
		console.log('[NotificationsService] Tentative de sauvegarde de notification...');
		const notification = this.notificationRepo.create(data);
		console.log('[NotificationsService] Objet notification créé:', notification);
		try {
			const saved = await this.notificationRepo.save(notification);
			console.log('[NotificationsService] Sauvegardé en BDD:', saved);
			return saved;
		} catch (err) {
			console.error('[NotificationsService] Erreur lors de la sauvegarde en BDD:', err);
			throw err;
		}
	}

	findByRecipient(recipient_id: string) {
		return this.notificationRepo.find({
			where: { 
				recipient_id,
				hidden_by_user: false  // on affiche seulement les notifications non masquées
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
		console.log('[NotificationsService] Recherche notification par lessonId:', lessonId);
		// on cherche les notifications de type booking_proposal (propositions du prof)
		let notif = await this.notificationRepo.findOne({
			where: {
				type: 'booking_proposal',
				data: Raw(alias => `${alias} ->> 'lessonId' = '${lessonId}'`)
			}
		});
		
		// si pas trouvé booking_proposal, on cherche booking_request
		if (!notif) {
			notif = await this.notificationRepo.findOne({
				where: {
					type: 'booking_request',
					data: Raw(alias => `${alias} ->> 'lessonId' = '${lessonId}'`)
				}
			});
		}
		
		console.log('[NotificationsService] Notification trouvée:', notif);
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
		console.log('[NotificationsService] Début correction des noms de prof manquants');
		
		// on trouve toutes les notifications de type booking_proposal sans teacherName
		const notifications = await this.notificationRepo.find({
			where: { type: 'booking_proposal' }
		});

		console.log(`[NotificationsService] Trouvé ${notifications.length} notifications de type booking_proposal`);
		
		let updatedCount = 0;
		
		for (const notification of notifications) {
			try {
				// on vérifie s'il y a déjà un teacherName
				if (notification.data?.teacherName) {
					console.log(`[NotificationsService] Notification ${notification.id} contient déjà teacherName`);
					continue;
				}

				// on récupère le lessonId
				const lessonId = notification.data?.lessonId;
				if (!lessonId) {
					console.log(`[NotificationsService] Notification ${notification.id} ne contient pas lessonId`);
					continue;
				}

				// on récupère les infos du cours
				const lessonResp = await lastValueFrom(
					this.httpService.get(`http://localhost:3004/lessons/${lessonId}`)
				);
				
				const lesson = lessonResp.data;
				if (!lesson || !lesson.teacherName) {
					console.log(`[NotificationsService] Impossible de récupérer les infos prof pour cours ${lessonId}`);
					continue;
				}

				// on met à jour les données de la notification
				const updatedData = {
					...notification.data,
					teacherId: lesson.teacherId,
					teacherName: lesson.teacherName
				};

				await this.notificationRepo.update(notification.id, {
					data: updatedData
				});

				console.log(`[NotificationsService] Notification ${notification.id} mise à jour avec teacherName: ${lesson.teacherName}`);
				updatedCount++;

			} catch (error) {
				console.error(`[NotificationsService] Erreur lors de la mise à jour notification ${notification.id}:`, error);
				// TODO : implémenter un système de retry pour les erreurs temporaires
			}
		}

		console.log(`[NotificationsService] ${updatedCount} notifications mises à jour`);
		return { success: true, updatedCount };
	}
}
