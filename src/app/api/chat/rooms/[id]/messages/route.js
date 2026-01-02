import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import ChatRoom from '@/models/ChatRoom';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const chatRoom = await ChatRoom.findById(params.id);
    
    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }
    
    // Check if user is a participant
    const userId = session.user.id;
    if (!chatRoom.participants.includes(userId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const messages = await Message.find({ chatRoomId: params.id })
      .populate('senderId', 'name image email')
      .sort({ createdAt: 1 })
      .lean();
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const chatRoom = await ChatRoom.findById(params.id);
    
    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }
    
    // Check if user is a participant
    const userId = session.user.id;
    if (!chatRoom.participants.includes(userId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { body: messageBody } = body;
    
    if (!messageBody || messageBody.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message body is required' },
        { status: 400 }
      );
    }
    
    const message = await Message.create({
      chatRoomId: params.id,
      senderId: userId,
      body: messageBody.trim(),
    });
    
    // Update chat room
    chatRoom.lastMessage = messageBody.trim();
    chatRoom.updatedAt = new Date();
    
    // If this is the first reply from a student, reveal anonymous identity
    if (chatRoom.isAnonymous && session.user.role === 'STUDENT') {
      chatRoom.isAnonymous = false;
    }
    
    await chatRoom.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name image email')
      .lean();
    
    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

