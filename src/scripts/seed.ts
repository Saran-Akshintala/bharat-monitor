import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminEmail = 'admin@bharatmonitor.com';
    const existingAdmin = await usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await usersService.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      });

      console.log('✅ Admin user created:');
      console.log('   Email: admin@bharatmonitor.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create demo user
    const demoEmail = 'demo@bharatmonitor.com';
    const existingDemo = await usersService.findByEmail(demoEmail);

    if (!existingDemo) {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      
      await usersService.create({
        email: demoEmail,
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: UserRole.USER,
      });

      console.log('✅ Demo user created:');
      console.log('   Email: demo@bharatmonitor.com');
      console.log('   Password: demo123');
    } else {
      console.log('ℹ️  Demo user already exists');
    }

    console.log('🎉 Database seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
