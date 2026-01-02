import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['VISITOR', 'STUDENT'],
      default: 'VISITOR',
    },
    category: {
      type: String,
      default: '',
    },
    semester: {
      type: Number,
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Busy'],
      default: 'Available',
    },
    profileCompletionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', userSchema);

