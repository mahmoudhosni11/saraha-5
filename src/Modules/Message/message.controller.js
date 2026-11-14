import { Router } from 'express';
const messageController = Router();
//health check route
messageController.get('/health', (req, res) => {
  res.send('message service is working fine ');
});

export default messageController;
