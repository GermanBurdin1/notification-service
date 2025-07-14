import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { UpdateResult } from 'typeorm';

const notificationMock: Notification = {
  id: 'uuid-1',
  recipient_id: 'user1',
  sender_id: 'teacher1',
  type: 'lesson',
  title: 'Lesson Reminder',
  message: 'Don\'t forget your lesson tomorrow!',
  data: {},
  status: 'unread',
  hidden_by_user: false,
  created_at: new Date(),
};

const notificationMockArray: Notification[] = [notificationMock];

const updateResultMock: UpdateResult = {
  generatedMaps: [],
  raw: [],
  affected: 1,
};

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn().mockResolvedValue(notificationMock),
            findByRecipient: jest.fn().mockResolvedValue(notificationMockArray),
            updateStatus: jest.fn().mockResolvedValue(updateResultMock),
            updateNotification: jest.fn().mockResolvedValue(updateResultMock),
            findByLessonId: jest.fn().mockResolvedValue(notificationMockArray),
            fixMissingTeacherNames: jest.fn().mockResolvedValue({ success: true }),
            hideNotificationForStudent: jest.fn().mockResolvedValue(updateResultMock),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const body = {
        recipient_id: 'user1',
        sender_id: 'teacher1',
        type: 'lesson',
        title: 'Test',
        message: 'Test message',
        data: {},
        status: 'unread',
        hidden_by_user: false,
      };

      (service.create as jest.Mock).mockResolvedValue({ ...notificationMock, ...body });

      const result = await controller.create(body);
      expect(service.create).toHaveBeenCalledWith(body);
      expect(result).toEqual({ ...notificationMock, ...body });
    });
  });

  describe('findByRecipient', () => {
    it('should return notifications for a user', async () => {
      const result = await controller.findByRecipient('user1');
      expect(service.findByRecipient).toHaveBeenCalledWith('user1');
      expect(result).toEqual(notificationMockArray);
    });
  });

  describe('updateNotification', () => {
    it('should update status if only status provided', async () => {
      const body = { status: 'read' };
      const result = await controller.updateNotification('uuid-1', body);
      expect(service.updateStatus).toHaveBeenCalledWith('uuid-1', 'read');
      expect(result).toEqual(updateResultMock);
    });

    it('should update multiple fields', async () => {
      const body = { status: 'read', message: 'Updated' };
      const result = await controller.updateNotification('uuid-1', body);
      expect(service.updateNotification).toHaveBeenCalledWith('uuid-1', body);
      expect(result).toEqual(updateResultMock);
    });
  });

  describe('findByLessonId', () => {
    it('should return notifications by lessonId', async () => {
      const result = await controller.findByLessonId('lesson-1');
      expect(service.findByLessonId).toHaveBeenCalledWith('lesson-1');
      expect(result).toEqual(notificationMockArray);
    });
  });

  describe('fixMissingTeacherNames', () => {
    it('should fix teacher names', async () => {
      const result = await controller.fixMissingTeacherNames();
      expect(service.fixMissingTeacherNames).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('hideNotificationForUser', () => {
    it('should hide notification', async () => {
      const result = await controller.hideNotificationForUser('uuid-1');
      expect(service.hideNotificationForStudent).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(updateResultMock);
    });
  });
});
