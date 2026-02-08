import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ApiOperation, ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProductDto, UserProfileDto } from './dto/product.dto';

@Controller('scrape')
@ApiTags('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get()
  @ApiOperation({ summary: 'Tek bir ürün sayfasını scrape eder' })
  @ApiQuery({
    name: 'url',
    required: true,
    description: "Ürün sayfasının URL'si",
  })
  async scrape(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL parametresi gereklidir.');
    }
    return await this.scraperService.scrapeProduct(url);
  }

  @Get('list')
  @ApiOperation({ summary: 'Ürün listesi sayfasını scrape eder' })
  @ApiQuery({
    name: 'url',
    required: true,
    description: "Ürün listesi sayfasının URL'si",
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün listesi başarıyla çekildi.',
    type: [ProductDto],
  })
  async scrapeList(@Query('url') url: string): Promise<ProductDto[]> {
    if (!url) {
      throw new BadRequestException('URL parametresi gereklidir.');
    }
    return await this.scraperService.scrapeProductList(url);
  }

  @Get('user')
  @ApiOperation({ summary: 'Kullanıcı profil sayfasını scrape eder' })
  @ApiQuery({
    name: 'url',
    required: true,
    description: "Kullanıcı profil sayfasının URL'si",
  })
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı profili başarıyla çekildi.',
    type: UserProfileDto,
  })
  async scrapeUser(@Query('url') url: string): Promise<UserProfileDto> {
    if (!url) {
      throw new BadRequestException('URL parametresi gereklidir.');
    }
    return await this.scraperService.scrapeUserProfile(url);
  }
}
