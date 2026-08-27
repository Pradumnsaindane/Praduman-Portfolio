import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n  API ready on http://localhost:${PORT}  (${process.env.NODE_ENV || 'development'})\n`);
    });
  })
  .catch((err) => {
    console.error('✖ Could not start server:', err.message);
    process.exit(1);
  });

// Fail loudly on unhandled rejections rather than dying silently.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
