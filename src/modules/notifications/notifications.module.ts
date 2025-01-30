import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.yandex.com',
        port: 465,
        auth: {
          user: 'andrewdragom97@yandex.com',
          pass: 'jvjsmqelxrokyjyq',
        },
      },
      defaults: {
        from: 'Andrew <andrewdragom97@yandex.com>',
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
