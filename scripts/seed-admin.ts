import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  // Default admin credentials - change these!
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@followuphealth.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminName = process.env.ADMIN_NAME || 'Admin';

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO admin_users (email, password_hash, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $3
       RETURNING id, email, name`,
      [adminEmail.toLowerCase(), passwordHash, adminName]
    );

    console.log('Admin user created/updated successfully:');
    console.log('  Email:', result.rows[0].email);
    console.log('  Name:', result.rows[0].name);
    console.log('\nYou can now login at /admin/login');
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAdmin();
