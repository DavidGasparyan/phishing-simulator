import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PhishingAttemptsService } from './phishing-attempts.service';
import { CreatePhishingAttemptDto } from './dto/create-phishing-attempt.dto';
import { UpdatePhishingAttemptDto } from './dto/update-phishing-attempt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('phishing-attempts')
@UseGuards(JwtAuthGuard)
export class PhishingAttemptsController {
  constructor(
    private readonly phishingAttemptsService: PhishingAttemptsService
  ) {}

  @Post()
  create(
    @Body() createPhishingAttemptDto: CreatePhishingAttemptDto,
    @Request() req
  ) {
    return this.phishingAttemptsService.create(
      createPhishingAttemptDto,
      req.user.id
    );
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() req
  ) {
    return this.phishingAttemptsService.findAll(
      Number(page),
      Number(limit),
      req.user
    );
  }

  @Get('/stats')
  getStats(@Request() req) {
    return this.phishingAttemptsService.getStats(req.user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.phishingAttemptsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePhishingAttemptDto: UpdatePhishingAttemptDto,
    @Request() req
  ) {
    return this.phishingAttemptsService.update(
      id,
      updatePhishingAttemptDto,
      req.user
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.phishingAttemptsService.remove(id, req.user);
  }
}
