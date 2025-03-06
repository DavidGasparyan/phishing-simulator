import { Test, TestingModule } from '@nestjs/testing';
import { PhishingSimulationController } from './phishing-simulation.controller';

describe('PhishingSimulationController', () => {
  let controller: PhishingSimulationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhishingSimulationController],
    }).compile();

    controller = module.get<PhishingSimulationController>(
      PhishingSimulationController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
