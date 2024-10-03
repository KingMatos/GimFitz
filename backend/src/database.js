const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('Database is connected on PostgreSQL');
    await client.query('SELECT NOW()'); // Simple query to test connection
    await client.release();
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } finally {
    await pool.end(); // Close the pool when finished (optional)
  }
})();
