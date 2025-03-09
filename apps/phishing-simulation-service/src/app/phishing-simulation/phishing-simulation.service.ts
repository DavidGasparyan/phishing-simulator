import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhishingAttempt } from '@phishing-simulator/shared-types';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { CreatePhishingEmailDto } from './create-phising-email.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PhishingSimulationService {
  private readonly logger = new Logger(PhishingSimulationService.name);
  private readonly emailTransporter: nodemailer.Transporter;
  private readonly encryptionKey: Buffer;
  private readonly trackingUrl: string;

  constructor(
    @InjectModel('PhishingAttempt')
    private phishingAttemptModel: Model<PhishingAttempt>,
    private configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    // Ensure the encryption key is exactly 32 bytes
    const configKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (configKey) {
      // If a config key exists, ensure it's exactly 32 bytes when converted from hex
      const keyBuffer = Buffer.from(configKey, 'hex');
      if (keyBuffer.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
      }
      this.encryptionKey = keyBuffer;
    } else {
      // Generate a new 32-byte key if no config key is provided
      this.encryptionKey = crypto.randomBytes(32);
    }

    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    });

    this.trackingUrl = this.configService.get<string>('TRACKING_URL', 'http://localhost:3002/api/simulation/phishing/track');
  }

  /**
   * Send a phishing simulation email
   */
  async sendPhishingEmail(createPhishingEmailDto: CreatePhishingEmailDto): Promise<PhishingAttempt> {
    try {
      const { recipientEmail, emailTemplate, createdBy } = createPhishingEmailDto;

      // Create attempt with tracking token
      const phishingAttempt = await this.phishingAttemptModel.create({
        recipientEmail,
        emailContent: emailTemplate,
        status: 'PENDING',
        createdBy,
      });

      const trackingToken = this.generateTrackingToken(phishingAttempt.id);
      const trackingUrl = `${this.trackingUrl}/${trackingToken}`;

      // Update the phishing attempt with tracking token
      phishingAttempt.trackingToken = trackingToken;
      await phishingAttempt.save();

      // Insert the tracking pixel into the email content
      const modifiedContent = this.insertTrackingPixel(emailTemplate, trackingUrl);

      await this.mailService.sendPhishingEmail({
        from: this.configService.get<string>('EMAIL_FROM', 'security@company.com'),
        to: recipientEmail,
        subject: 'Important Security Information',
        html: modifiedContent,
      });

      this.logger.log(`Phishing email sent to: ${recipientEmail}`);

      // Update the status to sent
      phishingAttempt.status = 'SENT';
      phishingAttempt.sentAt = new Date();
      await phishingAttempt.save();

      return phishingAttempt;
    } catch (error) {
      console.log(error);
      this.logger.error(`Error sending phishing email: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to send phishing email');
    }
  }

  /**
   * Validate a tracking token and return the associated phishing attempt ID
   */
  async validateTrackingToken(token: string): Promise<string> {
    try {
      const decrypted = this.decryptToken(token);

      // The decrypted token should be a valid attempt ID
      const attemptId = decrypted.id;

      // Validate that this attempt exists
      const attempt = await this.phishingAttemptModel.findById(attemptId);
      if (!attempt) {
        this.logger.warn(`Attempt not found for token: ${token}`);
        return null;
      }

      // Validate that the token matches
      if (attempt.trackingToken !== token) {
        this.logger.warn(`Token mismatch for attempt: ${attemptId}`);
        return null;
      }

      return attemptId;
    } catch (error) {
      this.logger.error(`Error validating tracking token: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate an encrypted tracking token for a phishing attempt
   */
  private generateTrackingToken(idOrReference: string): string {
    const data = {
      id: idOrReference,
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2, 15)
    };

    return this.encryptToken(data);
  }

  /**
   * Encrypt data into a token
   */
  private encryptToken(data: any): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return Buffer.from(`${iv.toString('hex')}:${encrypted}`).toString('base64');
  }

  /**
   * Decrypt a token into data
   */
  private decryptToken(token: string): any {
    try {
      const rawData = Buffer.from(token, 'base64').toString();
      const [ivHex, encryptedData] = rawData.split(':');

      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      this.logger.error(`Error decrypting token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Insert a tracking pixel into the email content
   */
  private insertTrackingPixel(emailContent: string, trackingUrl: string): string {
    // Add the tracking pixel at the end of the email
    return `${emailContent}
      <img src="${trackingUrl}" alt="" width="1" height="1" style="display:none" />
    `;
  }
}
