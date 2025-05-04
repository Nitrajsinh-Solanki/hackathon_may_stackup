


import mongoose from 'mongoose';

export interface IOTP extends mongoose.Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, 
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', otpSchema);

export default OTP;
