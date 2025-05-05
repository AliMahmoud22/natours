import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'Please provide your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your Email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid Email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['admin', 'user', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please enter a password'],
    minlength: [8, 'password must be at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'make sure that confirm password and password are the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async (candidatePassword, password) =>
  await bcrypt.compare(candidatePassword, password);

userSchema.methods.isPasswordChanged = function (tokenTimeStamp) {
  if (this.passwordChangedAt) {
    return this.passwordChangedAt.getTime() / 1000 > tokenTimeStamp;
  }

  return false;
};

userSchema.methods.createForgotPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
