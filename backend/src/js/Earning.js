const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createMonthlyEarningsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS earnings (
        id SERIAL PRIMARY KEY,
        month VARCHAR(255) NOT NULL,
        monthly_earnings NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Monthly Earnings table created successfully');
  } catch (error) {
    console.error('Error creating Monthly Earnings table:', error);
  } finally {
    client.release();
  }
};

module.exports = createMonthlyEarningsTable;
