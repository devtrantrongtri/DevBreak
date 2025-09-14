import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedingService } from '../database/seeding.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedingService = app.get(SeedingService);

  try {
    await seedingService.seedAll();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
