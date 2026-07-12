import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import morgan from 'morgan';
import business from './routes/bussinessRoutes.js';
import userRoutes from './routes/userRoutes.js';
import homeRoute from './routes/homeRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
// import searchRoutes from './routes/searchRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './middleware/globalErrorHandler.js'
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/business', business);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/home', homeRoute);
app.use('/api/v1/item', itemRoutes);
app.use('/api/v1/category', categoryRoutes);
// app.use('/api/v1/search', searchRoutes);

app.use((req, res, next) => {
  return next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
