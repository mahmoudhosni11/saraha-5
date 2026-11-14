import mongoose from 'mongoose';

/*
firstName
lastName
fullName
email
password
age
gender
profilePicture
phoneNumber
failedLoginAttempts
bannedUntil
is2StepVerificationEnabled
otp
otpExpiry
*/
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: [3, 'First name must be at least 3 characters long'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: [3, 'Last name must be at least 3 characters long'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: { name: 'idx_email_unique', unique: true },
    },
    password: {
      type: String,
      required: true,
      // وقفنا الـ set القديم علشان بقينا نعمل hash حقيقي بـ argon2 في الـ auth.service.js
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    age: {
      type: Number,
      min: [18, 'Age must be at least 18'],
      max: [100, 'Age must be at most 100'],
    },
    phoneNumber: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    // ميزة الأساينمنت 1: عداد المحاولات الفاشلة والحظر المؤقت
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    bannedUntil: {
      type: Date,
      default: null,
    },
    // ميزة الأساينمنت 1: التحقق بخطوتين 2-Step Verification
    is2StepVerificationEnabled: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} __ ${this.lastName}`;
        },
      },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

// مهم في اي بروجيكت تعملها علشان ماتنساش تعملها في كل مرة. لازم تكتب toObject و toJSON على true علشان ال virtuals تشتغل في ال response.
console.log({ allModels: mongoose.models });

// بعمل كرييت موديل بعد ما بعمل السكيمه
const User = mongoose.model('User', userSchema);

export default User;
