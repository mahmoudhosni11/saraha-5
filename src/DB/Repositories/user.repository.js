import User from '../Models/user.model.js';
import { DatabaseRepository } from '../database.repository.js';

// UserRepository بيورث من DatabaseRepository وبيديله User model
// ولو احتجنا نعمل query خاصة بالـ User بس نقدر نزودها هنا
export class UserRepository extends DatabaseRepository {
  constructor() {
    super(User);
  }

  // مثال: دالة خاصة للبحث بالإيميل
  async findByEmail(email) {
    return await this.findOne({ email });
  }
}

// بنعمل export لـ instance جاهزة للاستخدام في الـ Services
export const userRepository = new UserRepository();
