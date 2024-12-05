import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';

@Module({
  providers: [ScraperService],
  controllers: [ScraperController]
})
export class ScraperModule {}
