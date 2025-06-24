import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipient_id: string;

  @Column({ nullable: true })
  sender_id: string;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column('jsonb', { nullable: true })
  data: any;

  @Column({ default: 'unread' })
  status: string;

  @Column({ default: false })
  hidden_by_user: boolean;

  @CreateDateColumn()
  created_at: Date;
}
