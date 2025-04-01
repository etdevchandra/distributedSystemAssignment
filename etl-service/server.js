require('dotenv').config();
const { initDatabase } = require('./database');
const { startConsumer } = require('./consumer');

(async () => {
  try {
    const saveToDatabase = await initDatabase();
    await startConsumer(saveToDatabase);
  } catch (err) {
    console.error('ETL Startup Failed:', err.message);
    process.exit(1);
  }
})();
