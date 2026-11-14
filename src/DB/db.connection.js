import mongoose from 'mongoose';
const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_URI_LOCAL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit the process with an error code
  }
};
export default dbConnection;
