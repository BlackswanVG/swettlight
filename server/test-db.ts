
import { pool, db } from './db';

async function testConnection() {
  try {
    // Test the connection
    const result = await db.execute(sql`SELECT NOW()`);
    console.log('Database connection successful!');
    console.log('Current timestamp from DB:', result[0].now);
    
    // Close the connection pool
    await pool.end();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
