import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class NotificationsService {
	@EventPattern('lesson_created')
  handleLessonCreated(data: any) {
    console.log('📩 Новое уведомление:', data);
    // логика отправки уведомления студенту/преподавателю
  }
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  create(data: Partial<Notification>) {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
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
