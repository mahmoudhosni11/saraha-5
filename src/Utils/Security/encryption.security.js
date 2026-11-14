import crypto from 'node:crypto';

// المفتاح لازم يكون 32 بايت (256 بت) علشان شغالين بـ aes-256-cbc
// النص هنا 64 حرف hex فبنحوله بـ Buffer.from علشان يرجع 32 بايت بالظبط
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = parseInt(process.env.IV_LENGTH); // حجم الـ IV ثابت 16 بايت في خوارزمية AES

// دالة التشفير: بتاخد الـ plainText وترجع الـ iv والـ cipherText مفصولين بـ :
export const encrypt = (plainText) => {
  // Generate random iv bytes
  const iv = crypto.randomBytes(IV_LENGTH);
  console.log({ iv });

  const cipherObject = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

  let cipherText = cipherObject.update(plainText, 'utf-8', 'hex');

  cipherText += cipherObject.final('hex');

  return `${iv.toString('hex')}:${cipherText}`;
};

// دالة فك التشفير: بتاخد النص المشفر، تفصل الـ iv عن الـ cipherText، وترجع الـ plainText الأصلي
export const decrypt = (cipherData) => {
  const [ivHex, cipherText] = cipherData.split(':');

  const iv = Buffer.from(ivHex, 'hex');

  const decipherObject = crypto.createDecipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY,
    iv,
  );

  let plainText = decipherObject.update(cipherText, 'hex', 'utf-8');

  plainText += decipherObject.final('utf-8');

  return plainText;
};
