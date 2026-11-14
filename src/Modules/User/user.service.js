import { userRepository } from '../../DB/Repositories/user.repository.js';
import { isValidObjectId } from 'mongoose';
import { decrypt } from '../../Utils/Security/encryption.security.js';

/// ازاي اعمل find واعمل get user by id? بنستخدم الـ userRepository
export const getUserProfile = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID');
  }
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // فك تشفير رقم الموبايل قبل ما يرجع في الـ response
  if (user.phoneNumber) {
    user.phoneNumber = decrypt(user.phoneNumber);
  }
  return user;
};

// لو عاوز اعمل list لل users بنجيبهم عن طريق الـ repository
export const getAllUsers = async () => {
  return await userRepository.find({}, '-password', { limit: 2, skip: 1 });
};

// تحديث بيانات اليوزر
export const updateProfile = async (body, userId) => {
  const { firstName, lastName, email, gender, age } = body;
  const user = await userRepository.findById(userId);
  if (!user) throw new Error('invalid user id');

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (gender) user.gender = gender;
  if (age) user.age = age;
  if (email) {
    const ifExistingUser = await userRepository.findOne({
      email,
      _id: { $ne: userId },
    });
    if (ifExistingUser) {
      throw new Error('User already exists');
    }
    user.email = email;
  }
  return await user.save();
};

// مسح اليوزر عن طريق الـ repository
export const deleteProfile = async (userId) => {
  return await userRepository.deleteOne({ _id: userId });
};
