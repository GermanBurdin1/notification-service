import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<Repository<Notification>>;
  let httpService: jest.Mocked<HttpService>;

  const mockNotif = {
    id: '1',
    recipient_id: 'u1',
    type: 'info',
    title: 'Test',
    message: 'Hello',
    data: { lessonId: 'lesson1' },
  } as Notification;

  beforeEach(async () => {
    // setup du module avec mocks pour notifications
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            patch: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get(getRepositoryToken(Notification));
    httpService = module.get(HttpService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create une notification', async () => {
    // TODO : peut-être tester avec différents types de notif
    repo.create.mockReturnValue(mockNotif);
    repo.save.mockResolvedValue(mockNotif);

    const result = await service.create({
      recipient_id: 'u1',
      type: 'info',
      title: 'Test',
      message: 'Hello',
    });
    expect(result).toEqual(mockNotif);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('should find notifications by recipient', async () => {
    repo.find.mockResolvedValue([mockNotif]);
    const result = await service.findByRecipient('u1');
    expect(result).toEqual([mockNotif]);
    expect(repo.find).toHaveBeenCalled();
  });

  it('should update status', async () => {
    repo.update.mockResolvedValue({ affected: 1 } as any);
    await service.updateStatus('1', 'read');
    expect(repo.update).toHaveBeenCalledWith('1', { status: 'read' });
  });

  it('should update notification', async () => {
    repo.update.mockResolvedValue({ affected: 1 } as any);
    await service.updateNotification('1', { title: 'New Title' });
    expect(repo.update).toHaveBeenCalledWith('1', { title: 'New Title' });
  });

  it('should hide notification', async () => {
    repo.update.mockResolvedValue({ affected: 1 } as any);
    await service.hideNotificationForStudent('1');
    expect(repo.update).toHaveBeenCalledWith('1', { hidden_by_user: true });
  });

  it('should find by lessonId booking_proposal first', async () => {
    repo.findOne.mockResolvedValueOnce(mockNotif);
    const result = await service.findByLessonId('lesson1');
    expect(result).toEqual(mockNotif);
  });

  it('should fallback to booking_request if booking_proposal not found', async () => {
    repo.findOne.mockResolvedValueOnce(undefined).mockResolvedValueOnce(mockNotif);
    const result = await service.findByLessonId('lesson1');
    expect(result).toEqual(mockNotif);
  });

  it('should get notification by lessonId via HTTP', async () => {
    const mockAxiosResponse: AxiosResponse<any> = {
      data: mockNotif,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    httpService.get.mockReturnValue(of(mockAxiosResponse));
    const result = await service.getNotificationByLessonId('lesson1');
    expect(httpService.get).toHaveBeenCalled();
    expect(result).toEqual(mockNotif);
  });

  it('should update notification status via HTTP', async () => {
    const mockAxiosResponse: AxiosResponse<any> = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    httpService.patch.mockReturnValue(of(mockAxiosResponse));
    await service.updateNotificationStatus(mockNotif, true);
    expect(httpService.patch).toHaveBeenCalledWith(
      `http://localhost:3003/notifications/${mockNotif.id}`,
      { status: 'accepted' }
    );
  });

  it('should fix missing teacher names', async () => {
    const notifWithoutTeacher = {
      id: '1',
      type: 'booking_proposal',
      data: { lessonId: 'lesson2' },
    } as Notification;

    const notifWithTeacher = {
      id: '2',
      type: 'booking_proposal',
      data: { lessonId: 'lesson3', teacherName: 'John' },
    } as Notification;

    repo.find.mockResolvedValue([notifWithoutTeacher, notifWithTeacher]);

    const mockLessonAxiosResponse: AxiosResponse<any> = {
      data: {
        teacherId: 't1',
        teacherName: 'Alice',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    httpService.get.mockReturnValue(of(mockLessonAxiosResponse));
    repo.update.mockResolvedValue({ affected: 1 } as any);

    const result = await service.fixMissingTeacherNames();
    expect(repo.find).toHaveBeenCalled();
    expect(httpService.get).toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith(notifWithoutTeacher.id, {
      data: {
        lessonId: 'lesson2',
        teacherId: 't1',
        teacherName: 'Alice',
      },
    });
    expect(result).toEqual({ success: true, updatedCount: 1 });
  });
});
