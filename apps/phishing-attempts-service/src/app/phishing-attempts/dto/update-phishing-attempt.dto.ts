import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  MaxLength
} from 'class-validator';

export class UpdatePhishingAttemptDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Email content is too long' })
  emailContent?: string;

  @IsOptional()
  @IsIn(['PENDING', 'CLICKED', 'FAILED'], { message: 'Invalid status' })
  status?: 'PENDING' | 'CLICKED' | 'FAILED';
}
