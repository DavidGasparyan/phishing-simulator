import { Test, TestingModule } from '@nestjs/testing';
import { PhishingSimulationService } from './phishing-simulation.service';

describe('PhishingSimulationService', () => {
  let service: PhishingSimulationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhishingSimulationService],
    }).compile();

    service = module.get<PhishingSimulationService>(PhishingSimulationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
