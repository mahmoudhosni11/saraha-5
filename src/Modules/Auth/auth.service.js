import { userRepository } from '../../DB/Repositories/user.repository.js';
import { encrypt } from '../../Utils/Security/encryption.security.js';
import {
  hashPassword,
  comparePassword,
} from '../../Utils/Security/hash.security.js';
import {
  generateTokens,
  generateOTP,
} from '../../Utils/Security/token.security.js';
import { AppError } from '../../Utils/Error/appError.js';

// 1. تسجيل مستخدم جديد
export const registerUser = async (body) => {
  const { firstName, lastName, email, password, gender, age, phone } = body;

  const ifExistingUser = await userRepository.findByEmail(email);
  if (ifExistingUser) {
    throw new AppError('Email already exists', 409);
  }

  // تشفير رقم الموبايل بـ AES-256 قبل الحفظ
  let encryptedPhone;
  if (phone) encryptedPhone = encrypt(phone);

  // تشفير الباسورد بـ Argon2
  const hashedPassword = await hashPassword(password);

  return await userRepository.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    gender,
    age,
    phoneNumber: encryptedPhone || undefined,
  });
};

// 2. تسجيل الدخول مع ميزة الحظر المؤقت بعد 5 محاولات فاشلة + فحص التحقق بخطوتين
export const SignIn = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 400);
  }

  // أ) فحص هل الحساب محظور حالياً بسبب 5 محاولات فاشلة؟
  if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
    const remainingTime = Math.ceil(
      (new Date(user.bannedUntil) - Date.now()) / (60 * 1000),
    );
    throw new AppError(
      `Your account is temporarily banned for 5 minutes due to 5 consecutive failed login attempts. Try again after ${remainingTime} minute(s).`,
      403,
    );
  }

  // لو فترة الحظر انتهت بنلغي الحظر ونصفر العداد
  if (user.bannedUntil && new Date(user.bannedUntil) <= new Date()) {
    user.bannedUntil = null;
    user.failedLoginAttempts = 0;
  }

  // ب) مقارنة الباسورد باستخدام Argon2
  const isPasswordMatch = await comparePassword(user.password, password);

  // لو الباسورد غلط: نزود عداد المحاولات الفاشلة ونفحص لو وصل 5
  if (!isPasswordMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    // لو وصل 5 محاولات فاشلة متتالية: حظر الحساب لمدة 5 دقائق
    if (user.failedLoginAttempts >= 5) {
      user.bannedUntil = new Date(Date.now() + 5 * 60 * 1000); // حظر 5 دقائق
      user.failedLoginAttempts = 0; // تصفير العداد
      await user.save();
      throw new AppError(
        'Too many failed attempts (5 times). Your account is temporarily banned for 5 minutes.',
        403,
      );
    }

    await user.save();
    const remainingAttempts = 5 - user.failedLoginAttempts;
    throw new AppError(
      `Invalid email or password. Warning: ${remainingAttempts} attempt(s) remaining before account ban.`,
      400,
    );
  }

  // ج) لو الباسورد صح: نصفر محاولات الفشل والحظر
  user.failedLoginAttempts = 0;
  user.bannedUntil = null;

  // د) فحص ميزة الـ 2-Step Verification:
  // لو مفعلة: نبعت OTP للإيميل ومنديهوش التوكن غير لما يأكد الكود
  if (user.is2StepVerificationEnabled) {
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // صلاحية الـ OTP خمس دقايق
    await user.save();

    console.log(`\n========================================`);
    console.log(`[2FA LOGIN OTP for ${user.email}]: ${otp}`);
    console.log(`========================================\n`);

    return {
      requires2FA: true,
      message:
        'A verification code (OTP) has been sent to your email. Please submit it to /api/auth/login-confirmation to receive your tokens.',
      email: user.email,
    };
  }

  // لو مش مفعل الـ 2-Step Verification: يستلم التوكنز مباشرة بدون خطوات إضافية
  await user.save();
  const tokens = generateTokens({ id: user._id, email: user.email });
  return {
    requires2FA: false,
    message: 'User logged in successfully',
    tokens,
    user,
  };
};

// 3. تأكيد تسجيل الدخول بالـ OTP واستلام الـ Tokens (Login Confirmation Endpoint)
export const confirmLoginOTP = async ({ email, otp }) => {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.otp || !user.otpExpiry) {
    throw new AppError('No pending 2FA login request found for this user', 400);
  }

  // فحص صلاحية الوقت للـ OTP
  if (new Date(user.otpExpiry) < new Date()) {
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    throw new AppError('OTP code has expired. Please login again to request a new code.', 400);
  }

  // فحص تطابق كود الـ OTP
  if (user.otp !== String(otp).trim()) {
    throw new AppError('Invalid OTP code. Please check your code and try again.', 400);
  }

  // مسح الـ OTP بعد استخدامه وتوليد التوكنز
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const tokens = generateTokens({ id: user._id, email: user.email });
  return {
    message: 'OTP validated successfully. Welcome back!',
    tokens,
    user,
  };
};

// 4. طلب تفعيل الـ 2-Step Verification (Enable 2-Step Verification Endpoint)
export const requestEnable2FA = async ({ email }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.is2StepVerificationEnabled) {
    throw new AppError('2-Step Verification is already enabled on this account', 400);
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  console.log(`\n========================================`);
  console.log(`[ENABLE 2FA OTP for ${user.email}]: ${otp}`);
  console.log(`========================================\n`);

  return {
    message:
      'A verification code (OTP) has been sent to your email. Submit it to /api/auth/2fa/verify to activate 2-step verification.',
    email: user.email,
  };
};

// 5. تأكيد تفعيل الـ 2-Step Verification بعد إدخال الـ OTP
export const verifyAndEnable2FA = async ({ email, otp }) => {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.otp || !user.otpExpiry) {
    throw new AppError('No pending 2FA activation request found', 400);
  }

  if (new Date(user.otpExpiry) < new Date()) {
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    throw new AppError('OTP has expired. Please request a new activation code.', 400);
  }

  if (user.otp !== String(otp).trim()) {
    throw new AppError('Invalid OTP code', 400);
  }

  user.is2StepVerificationEnabled = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return {
    message: '2-Step Verification has been successfully enabled on your account.',
  };
};
