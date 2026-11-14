import jwt from 'jsonwebtoken';

// سر الـ JWT وقيمته الافتراضية
const JWT_SECRET = process.env.JWT_SECRET || 'sarahah_app_secret_key_2026';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'sarahah_app_refresh_secret_key_2026';

// توليد Access Token و Refresh Token لليوزر
export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

// فحص صحة الـ Token
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// توليد كود OTP مكون من 6 أرقام عشوائية
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
