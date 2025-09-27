#!/bin/bash

# Fix CORS Configuration Script for DevBreak
# Usage: ./fix-cors.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[FIX]${NC} $1"
}

print_header "🔧 Fixing CORS Configuration for DevBreak"

# 1. Check if main.ts exists
if [ ! -f "app-server/src/main.ts" ]; then
    print_error "app-server/src/main.ts not found. Make sure you're in the DevBreak root directory."
    exit 1
fi

# 2. Backup main.ts
print_status "Creating backup of main.ts..."
cp app-server/src/main.ts app-server/src/main.ts.bak

# 3. Update CORS configuration in main.ts
print_status "Updating CORS configuration in main.ts..."
cat > app-server/src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SystemInitializationService } from './system/system-initialization.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configuration
  app.enableCors({
    origin: [
      'https://devtri.xyz',
      'http://localhost:3000',
      'http://localhost',
      /\.devtri\.xyz$/  // Allow all subdomains
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });
  
  // Set global prefix
  app.setGlobalPrefix('');
  
  // Validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('DevBreak API')
    .setDescription('DevBreak API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Initialize system
  const systemInitService = app.get(SystemInitializationService);
  await systemInitService.initializeSystem();
  
  // Start server
  await app.listen(3001);
  console.log(`🚀 Application is running on: http://localhost:3001`);
  console.log(`📚 Swagger documentation: http://localhost:3001/api`);
}

bootstrap();
EOF

print_status "✅ Updated CORS configuration in main.ts"

# 4. Rebuild backend image
print_status "Rebuilding backend image..."
docker build -t devbreak-backend:latest ./app-server
print_status "✅ Rebuilt backend image"

# 5. Restart backend container
print_status "Restarting backend container..."
docker restart devbreak_backend
print_status "✅ Restarted backend container"

# 6. Wait for backend to start
print_status "Waiting for backend to start..."
sleep 10

print_header "🎉 CORS configuration fix completed!"
print_status "The backend now allows requests from:"
print_status "  - https://devtri.xyz"
print_status "  - http://localhost:3000"
print_status "  - http://localhost"
print_status "  - *.devtri.xyz (all subdomains)"
print_status ""
print_status "You can check the backend logs with:"
print_status "  docker logs devbreak_backend"
