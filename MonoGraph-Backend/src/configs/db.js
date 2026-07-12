import mongoose from 'mongoose';

const databaseConnect = () => {
  mongoose
    .connect(process.env.MONGO_URL || 'mongodb://localhost:27017/fee', {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log('database connected!');
    })
    .catch(err => {
      console.log(err.message);
      console.log('database connection failed, exiting now...');
      if (process.env.NODE_ENV !== 'development') process.exit(1);
    });
};

export default databaseConnect;
