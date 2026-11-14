import { Router } from 'express';
import * as authService from './auth.service.js';
import { asyncHandler } from '../../Utils/Error/asyncHandler.js';

const authController = Router();

// 1. تسجيل مستخدم جديد
authController.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, gender, age, phone } = req.body;
    const result = await authService.registerUser({
      firstName,
      lastName,
      email,
      password,
      gender,
      age,
      phone,
    });
    res
      .status(201)
      .json({ message: 'User registered successfully', data: result });
  }),
);

// 2. تسجيل الدخول (مع الحظر بعد 5 محاولات فاشلة + فحص التحقق بخطوتين)
authController.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.SignIn({ email, password });
    res.status(200).json(result);
  }),
);

// 3. تأكيد تسجيل الدخول بالـ OTP (Login confirmation endpoint)
authController.post(
  '/login-confirmation',
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const result = await authService.confirmLoginOTP({ email, otp });
    res.status(200).json(result);
  }),
);

// 4. طلب تفعيل ميزة التحقق بخطوتين 2-Step Verification
authController.post(
  '/2fa/enable',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.requestEnable2FA({ email });
    res.status(200).json(result);
  }),
);

// 5. تأكيد وتفعيل ميزة الـ 2-Step Verification بعد التحقق من الـ OTP
authController.post(
  '/2fa/verify',
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const result = await authService.verifyAndEnable2FA({ email, otp });
    res.status(200).json(result);
  }),
);

export default authController;
