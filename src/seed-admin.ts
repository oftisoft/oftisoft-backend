import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Favorite } from './entities/favorite.entity';
import { Product } from './entities/product.entity';

// Load environment variables
config();

async function seedAdmin() {
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
  console.log('DATABASE_USER:', process.env.DATABASE_USER);
  console.log('DATABASE_NAME:', process.env.DATABASE_NAME);

  // Validate environment variables
  if (
    !process.env.DATABASE_HOST ||
    !process.env.DATABASE_USER ||
    !process.env.DATABASE_PASSWORD ||
    !process.env.DATABASE_NAME
  ) {
    console.error('Missing required database environment variables');
    console.error(
      'Make sure .env file exists and contains DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME',
    );
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, RefreshToken, Favorite, Product],
    ssl:
      process.env.DATABASE_SSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : false,
  });

  await dataSource.initialize();
  console.log('Database connected');

  const userRepository = dataSource.getRepository(User);

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'oftisoft@gmail.com' },
  });

  if (existingAdmin) {
    // Update to SuperAdmin if exists
    existingAdmin.role = 'SuperAdmin';
    existingAdmin.isActive = true;
    existingAdmin.isEmailVerified = true;
    await userRepository.save(existingAdmin);
    console.log('Existing user updated to SuperAdmin:', existingAdmin.email);
  } else {
    // Create new SuperAdmin
    const hashedPassword = await bcrypt.hash('Rasel1212@@', 12);

    const admin = userRepository.create({
      email: 'oftisoft@gmail.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SuperAdmin',
      isActive: true,
      isEmailVerified: true,
      subscriptionPlan: 'Business',
      subscriptionStatus: 'active',
    });

    await userRepository.save(admin);
    console.log('SuperAdmin created:', admin.email);
  }

  await dataSource.destroy();
  console.log('Seeding completed');
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
