import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { configDotenv } from 'dotenv';
import fs, { readFileSync } from 'fs';
import { GetOrResolveOptions } from '@nestjs/common/interfaces';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    configDotenv();
    const expressInstance = new ExpressAdapter();
    const app = await NestFactory.create(ApplicationModule, expressInstance, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose']
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    const options = new DocumentBuilder()
        .setTitle('NestJS Realworld Example App')
        .setDescription('The Realworld API description')
        .setVersion('1.0')
        .setBasePath('api')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    fs.writeFileSync('./dist/swagger.json', JSON.stringify(document));
    const json = JSON.parse(readFileSync('./dist/swagger.json', 'utf8'));
    expressInstance.get('/docs/json', (req: any, res: any) => {
        res.set('Content-Type', 'application/json');
        res.send(json);
    });
    SwaggerModule.setup('/docs', app, document);
    await app.listen(parseInt(process.env.PORT ?? '3080', 10));
    return expressInstance;
}
export default bootstrap();
