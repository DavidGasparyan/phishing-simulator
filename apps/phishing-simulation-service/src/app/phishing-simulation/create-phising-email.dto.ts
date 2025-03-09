import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePhishingEmailDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Recipient email is required' })
  recipientEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Email template is required' })
  @MaxLength(500, { message: 'Email template is too long' })
  emailTemplate: string;

  @IsString()
  createdBy: string;
}
