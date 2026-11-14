import './Config/env.config.js';
import express from 'express';
import userController from './Modules/User/user.controller.js';
import authController from './Modules/Auth/auth.controller.js';
import messageController from './Modules/Message/message.controller.js';
import dbConnection from './DB/db.connection.js';

const app = express();
const port = process.env.PORT || 3000;

// middleware to parse JSON request bodies
app.use(express.json());

/////////////////////////
// project routes - controller
app.use(`/api/auth`, authController);
app.use(`/api/users`, userController);
app.use(`/api/messages`, messageController);

////////////// db connection
dbConnection();

// sample api for demonstration
app.get('/', (req, res) => {
  res.send('API is working fine');
});

//not found endpoint (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handling Middleware (Custom Error Handler)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message,
    ...(process.env.NODE_ENV === 'local' && { stack: err.stack }),
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
