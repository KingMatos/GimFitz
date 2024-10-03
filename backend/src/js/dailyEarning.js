const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createDailyEarningsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_earnings (
        id SERIAL PRIMARY KEY,
        daily_earnings TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Daily Earnings table created successfully');
  } catch (error) {
    console.error('Error creating Daily Earnings table:', error);
  } finally {
    client.release();
  }
};

module.exports = createDailyEarningsTable;
