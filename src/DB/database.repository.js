// Base Database Repository
// كلاس عام جواه كل العمليات الأساسية للتعامل مع الداتا بيز (CRUD Operations)
// بحيث أي موديل بعد كدا (User, Message, etc.) يقدر يورث منه أو يستخدمه
export class DatabaseRepository {
  constructor(model) {
    this.model = model;
  }

  // إضافة document جديد
  async create(data) {
    return await this.model.create(data);
  }

  // البحث عن كل الـ documents مع إمكانية التحديد والترتيب والتخطي
  async find(filter = {}, select = '', options = {}) {
    return await this.model.find(filter, select, options);
  }

  // البحث عن document واحد بشرط معين
  async findOne(filter = {}, select = '', options = {}) {
    return await this.model.findOne(filter, select, options);
  }

  // البحث عن document بالـ ID بتاعه
  async findById(id, select = '', options = {}) {
    return await this.model.findById(id, select, options);
  }

  // تحديث document واحد
  async updateOne(filter, data, options = {}) {
    return await this.model.updateOne(filter, data, options);
  }

  // البحث بالـ ID والتحديث مع إرجاع الداتا الجديدة
  async findByIdAndUpdate(
    id,
    data,
    options = { new: true, runValidators: true },
  ) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  // مسح document واحد
  async deleteOne(filter) {
    return await this.model.deleteOne(filter);
  }

  // مسح بالـ ID
  async findByIdAndDelete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  // عد الـ documents
  async countDocuments(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}
