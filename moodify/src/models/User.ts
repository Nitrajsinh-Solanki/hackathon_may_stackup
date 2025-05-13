// moodify\src\models\User.ts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UploadedTrack {
  title: string;
  artist?: string;
  cloudinaryUrl: string;
  coverImage?: string;
  duration: number;
  genre?: string;
  mood?: string;
  uploadedAt: Date;
}

export interface LikedTrack {
  trackId: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  genre?: string;
  mood?: string;
  cloudinaryUrl?: string; 
  likedAt: Date;
}

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  uploadedTracks: UploadedTrack[];
  likedTracks: LikedTrack[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const uploadedTrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  artist: {
    type: String,
    trim: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  duration: {
    type: Number,
    required: true,
  },
  genre: {
    type: String,
  },
  mood: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const likedTrackSchema = new mongoose.Schema({
  trackId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  artwork: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  genre: {
    type: String,
  },
  mood: {
    type: String,
  },
  cloudinaryUrl: {
    type: String,
  },
  likedAt: {
    type: Date,
    default: Date.now,
  },
});


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    uploadedTracks: [uploadedTrackSchema],
    likedTracks: [likedTrackSchema],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
