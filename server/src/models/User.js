import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, default: 'Admin' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select:false so the hash never leaves the DB unless explicitly requested
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

// Hash the password whenever it is set or changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
