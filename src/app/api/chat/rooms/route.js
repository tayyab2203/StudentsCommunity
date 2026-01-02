import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ChatRoom from '@/models/ChatRoom';
import User from '@/models/User';
import Message from '@/models/Message';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const userId = session.user.id;
    
    const chatRooms = await ChatRoom.find({
      participants: userId,
    })
      .populate('participants', 'name image email')
      .sort({ updatedAt: -1 })
      .lean();
    
    // Get last message for each room
    const roomsWithMessages = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = await Message.findOne({ chatRoomId: room._id })
          .sort({ createdAt: -1 })
          .populate('senderId', 'name image')
          .lean();
        
        return {
          ...room,
          lastMessage: lastMessage || null,
        };
      })
    );
    
    return NextResponse.json({ rooms: roomsWithMessages });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const body = await request.json();
    const { recipientId, isAnonymous = false } = body;
    
    if (!recipientId) {
      return NextResponse.json(
        { error: 'recipientId is required' },
        { status: 400 }
      );
    }
    
    const senderId = session.user.id;
    
    // Check if room already exists
    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [senderId, recipientId] },
    }).populate('participants', 'name image email');
    
    if (!chatRoom) {
      // Create new room
      chatRoom = await ChatRoom.create({
        participants: [senderId, recipientId],
        isAnonymous: isAnonymous && session.user.role === 'VISITOR',
      });
      
      chatRoom = await ChatRoom.findById(chatRoom._id)
        .populate('participants', 'name image email')
        .lean();
    }
    
    return NextResponse.json({ room: chatRoom }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}

