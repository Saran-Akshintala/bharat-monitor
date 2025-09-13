import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  try {
    // Check if users already exist
    const existingUsers = await userModel.countDocuments();
    
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seed');
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = new userModel({
      email: 'admin@bharatmonitor.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });
    await adminUser.save();

    // Create demo user
    const demoPassword = await bcrypt.hash('Demo@123', 10);
    const demoUser = new userModel({
      email: 'demo@bharatmonitor.com',
      password: demoPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'user',
    });
    await demoUser.save();

    // Create test user
    const testPassword = await bcrypt.hash('Test@123', 10);
    const testUser = new userModel({
      email: 'test@bharatmonitor.com',
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
    });
    await testUser.save();

    console.log('✅ Demo users created successfully');
    console.log('');
    console.log('👤 Admin User:');
    console.log('   Email: admin@bharatmonitor.com');
    console.log('   Password: Admin@123');
    console.log('');
    console.log('👤 Demo User:');
    console.log('   Email: demo@bharatmonitor.com');
    console.log('   Password: Demo@123');
    console.log('');
    console.log('👤 Test User:');
    console.log('   Email: test@bharatmonitor.com');
    console.log('   Password: Test@123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await app.close();
  }
}

seed();
