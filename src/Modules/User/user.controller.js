import { Router } from 'express';
import * as userService from './user.service.js';
import { asyncHandler } from '../../Utils/Error/asyncHandler.js';

const userController = Router();

// health check route
userController.get('/health', (req, res) => {
  res.send('user service is healthy');
});

// هنا بعمل endpoint جديد اسمه profile و ده هيبعتلي ال user profile based on the userId اللي هتبعتلي في ال params
userController.get(
  '/profile/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userProfile = await userService.getUserProfile(userId);
    res
      .status(200)
      .json({ message: 'User profile fetched successfully', data: userProfile });
  }),
);

// get all users
userController.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers();
    res
      .status(200)
      .json({ message: 'All users fetched successfully', data: result });
  }),
);

// update user
userController.patch(
  '/update/:userId',
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, gender, age } = req.body;
    const { userId } = req.params;
    const result = await userService.updateProfile(
      { firstName, lastName, email, gender, age },
      userId,
    );
    res.status(200).json({ message: 'User updated successfully', data: result });
  }),
);

// delete user
userController.delete(
  '/delete/:userId',
  asyncHandler(async (req, res) => {
    const result = await userService.deleteProfile(req.params.userId);
    res.status(200).json({ message: 'User Deleted successfully', data: result });
  }),
);

export default userController;
