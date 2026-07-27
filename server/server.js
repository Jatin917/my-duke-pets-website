import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/db.js';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;

// Hostinger Node hosting requires listen() within ~3s — do not await SMTP verify first.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

      import('./src/utils/email.js')
        .then(({ verifySmtpOnStartup }) => verifySmtpOnStartup())
        .catch((err) => console.error('[email] SMTP startup check error:', err.message));
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
