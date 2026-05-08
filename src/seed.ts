import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './system/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const seeder = app.get(SeederService);
    await seeder.seed();
    console.log('Seeding executed successfully.');
  } catch (error) {
    console.error('Seeding failed.', error);
  } finally {
    await app.close();
  }
}
bootstrap();
