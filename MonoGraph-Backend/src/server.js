import mongoose from 'mongoose';
import app from './app.js';
import dbConnect from './configs/db.js';
const port = process.env.PORT || 8000;

dbConnect()

app
  .listen(port)
  .on('listening', () => {
    console.log(`Sever is running on port ${port}`);
  })
  .on('error', err => {
    console.error('Server error:', err);
  });

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
