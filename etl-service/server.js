require('dotenv').config();
const { initDatabase } = require('./database');
const { startConsumer } = require('./consumer');

(async () => {
  try {
    // Wait 5 seconds to allow MySQL to become ready
    console.log('Waiting 5 seconds for the database to fully start...');
    await new Promise(res => setTimeout(res, 5000));

    const saveToDatabase = await initDatabase();
    await startConsumer(saveToDatabase);
  } catch (err) {
    console.error('ETL Startup Failed:', err.message);
    process.exit(1);
  }
})();
