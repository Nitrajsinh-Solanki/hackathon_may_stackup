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

export interface SavedPlaylist {
  playlistId: string;
  title: string;
  description?: string;
  coverImage: string;
  trackCount: number;
  creator?: string;
  savedAt: Date;
}

export interface SavedAlbum {
  albumId: string;
  title: string;
  artist: string;
  coverImage: string;
  year?: string;
  genre?: string;
  trackCount: number;
  savedAt: Date;
}

export interface PlaylistTrack {
  trackId: string;
  title: string;
  artist: string;
  cloudinaryUrl: string;
  coverImage?: string;
  duration: number;
  addedAt: Date;
}

export interface CreatedPlaylist {
  name: string;
  description?: string;
  coverImage?: string;
  tracks: PlaylistTrack[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  uploadedTracks: UploadedTrack[];
  likedTracks: LikedTrack[];
  savedPlaylists: SavedPlaylist[];
  savedAlbums: SavedAlbum[];
  createdPlaylists: CreatedPlaylist[];
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

const savedPlaylistSchema = new mongoose.Schema({
  playlistId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  coverImage: {
    type: String,
    required: true,
  },
  trackCount: {
    type: Number,
    required: true,
  },
  creator: {
    type: String,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

const savedAlbumSchema = new mongoose.Schema({
  albumId: {
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
  coverImage: {
    type: String,
    required: true,
  },
  year: {
    type: String,
  },
  genre: {
    type: String,
  },
  trackCount: {
    type: Number,
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

const playlistTrackSchema = new mongoose.Schema({
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
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const createdPlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
  },
  tracks: [playlistTrackSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
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
    savedPlaylists: [savedPlaylistSchema],
    savedAlbums: [savedAlbumSchema],
    createdPlaylists: [createdPlaylistSchema],
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
