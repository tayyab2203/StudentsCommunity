import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ updatedAt: -1 });

export default mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);

