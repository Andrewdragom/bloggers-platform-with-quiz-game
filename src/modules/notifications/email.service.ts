import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      from: 'Andrew <andrewdragom97@yandex.com>',
      to: email,
      subject: 'Email Confirmation',
      html: `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
 </p>`,
    });
  }
  async sendEmailPasswordRecoveryMessage(
    email: string,
    confirmationCode: string | null | number,
  ) {
    await this.mailerService.sendMail({
      from: 'Andrew <andrewdragom97@yandex.com>',
      to: email,
      subject: 'Password recovery',
      html: `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
      </p>`,
    });
  }
}
