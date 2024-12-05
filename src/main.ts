import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Dolap Scraper API')
    .setDescription('Dolap ürünlerini scrape eden API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.init();
  return createServer(app.getHttpAdapter().getInstance());
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
