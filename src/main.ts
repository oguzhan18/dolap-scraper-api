import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS izinlerini aktif et
  app.enableCors({
    origin: '*', // Vercel'de sorun yaşamamak için tüm kaynaklara izin ver
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  const config = new DocumentBuilder()
    .setTitle('Dolap Scraper API')
    .setDescription('Dolap ürünlerini scrape eden API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Dolap Scraper API',
    customfavIcon:
      'https://raw.githubusercontent.com/oguzhan18/seo-tools-api/main/assests/seo-tools-api-logo.png',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
