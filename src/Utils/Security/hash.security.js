import * as argon2 from 'argon2';
import bcrypt from 'bcrypt';

// دالة الهاش باستخدام Argon2 (الأقوى لأنها بتستهلك CPU + Memory)
// بتاخد الباسورد العادي (plainText) وترجع الـ hash جاهز وجواه الـ salt والـ config تلقائياً
export const hashPassword = async (plainText) => {
  return await argon2.hash(plainText);
};

// دالة المقارنة في الـ Login باستخدام Argon2
// ملاحظة مهمة: في argon2.verify الترتيب بيكون (hashedPassword الأول، وبعدين plainText)
export const comparePassword = async (hashedPassword, plainText) => {
  return await argon2.verify(hashedPassword, plainText);
};

/* 
// لو حبيت تستخدم Bcrypt بدل Argon2:
// في Bcrypt بنحدد عدد الـ saltRounds (مثلاً 10)
export const hashWithBcrypt = async (plainText, saltRounds = 10) => {
  return await bcrypt.hash(plainText, saltRounds);
};

// في bcrypt.compare الترتيب عكس argon2: بنبعت الـ plainText الأول وبعدين الـ hashedPassword
export const compareWithBcrypt = async (plainText, hashedPassword) => {
  return await bcrypt.compare(plainText, hashedPassword);
};
*/
