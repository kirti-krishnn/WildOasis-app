import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import type { IUser } from '../models/usersModel.ts';

class Email {
  to: string;
  name: string;
  url: string;
  from: string;

  constructor(user: Pick<IUser, 'email' | 'name'>, url: string) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = process.env.EMAIL_FROM || 'noreply@wildoasis.local';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.EMAIL_PORT || 2525),
      auth: {
        user: process.env.EMAIL_USERNAME || 'your_mailtrap_user',
        pass: process.env.EMAIL_PASSWORD || 'your_mailtrap_pass',
      },
    } as SMTPTransport.Options);
  }

  async send(subject: string, text: string) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'Welcome to Wild Oasis',
      `Welcome to Wild Oasis, ${this.name}! Please visit: ${this.url}`
    );
  }

  async sendPasswordReset() {
    await this.send(
      'Your password reset token (valid for 10 minutes)',
      `Reset your password using the following link: ${this.url}`
    );
  }
}

export default Email;


