import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { configDotenv } from 'dotenv';
import { writeFileSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';

async function generateSwagger() {
    configDotenv();

    const app = await NestFactory.create(ApplicationModule, {
        logger: false, // Disable logging for script
    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    const options = new DocumentBuilder()
        .setTitle('NestJS Realworld Example App')
        .setDescription('The Realworld API description')
        .setVersion('1.0')
        .setBasePath('api')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, options);

    // Write swagger.json to root directory
    writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

    console.log('Swagger JSON generated successfully at ./swagger.json');

    await app.close();
    process.exit(0);
}

generateSwagger().catch((error) => {
    console.error('Error generating Swagger JSON:', error);
    process.exit(1);
});
