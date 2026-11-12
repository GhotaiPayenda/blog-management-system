/**
 * Seed script to create an initial admin account.
 * Usage: node database/seed.js
 * Requires .env with DB credentials and ADMIN_* seed values.
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function seed() {
  const {
    DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
    ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
  } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: DB_HOST || 'localhost',
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER || 'root',
    password: DB_PASSWORD || '',
    database: DB_NAME || 'blog_management',
    multipleStatements: false,
  });

  try {
    const [rows] = await connection.execute(
      'SELECT id FROM admins WHERE email = ? LIMIT 1',
      [ADMIN_EMAIL]
    );
    if (rows.length > 0) {
      console.log('Admin already exists with this email. Skipping seed.');
      return;
    }

    const saltRounds = 10;
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
    await connection.execute(
      'INSERT INTO admins (name, email, password, role, status, token_version) VALUES (?, ?, ?, ?, ?, ?)',
      [ADMIN_NAME, ADMIN_EMAIL, hashed, 'Admin', 'Active', 0]
    );
    console.log('Admin account created successfully.');
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
