import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get(':recipientId')
  findByRecipient(@Param('recipientId') recipientId: string) {
    return this.service.findByRecipient(recipientId);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }
}
