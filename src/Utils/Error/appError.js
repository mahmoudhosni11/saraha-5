// Custom Error Class للتحكم في رسالة الخطأ والـ Status Code
// بدل ما كل الإيرورز ترجع كـ 500
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }
}
