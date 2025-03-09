import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

interface SendPhishingEmailOptions {
  to: string;
  subject: string;
  from: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger: Logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.mailtrap.io'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false, // Use TLS
      requireTLS: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
    });
  }

  async sendPhishingEmail(options: SendPhishingEmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_FROM', '"Phishing Simulator" <noreply@example.com>'),
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Phishing email sent to ${options.to}`);
      this.logger.log(`Email sent info: ${JSON.stringify(info)}`);
    } catch (error) {
      this.logger.error('Failed to send phishing email', error);

      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }

      throw error;
    }
  }

  // Test method to verify email configuration
  async testConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter connection verified successfully');
    } catch (error) {
      this.logger.error('Failed to verify email transporter connection', error);
      throw error;
    }
  }
}
