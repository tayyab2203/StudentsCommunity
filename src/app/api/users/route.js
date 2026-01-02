import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Message from '@/models/Message';
import { sortUsersByRanking } from '@/lib/ranking';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Build query - only show STUDENT role users
    const query = { role: 'STUDENT' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    // Get all matching students
    const students = await User.find(query).lean();
    
    // Get message counts for ranking
    const messageCounts = {};
    for (const student of students) {
      const count = await Message.countDocuments({ senderId: student._id });
      messageCounts[student._id] = count;
    }
    
    // Sort by ranking
    const rankedStudents = sortUsersByRanking(students, messageCounts);
    
    // Paginate
    const paginatedStudents = rankedStudents.slice(skip, skip + limit);
    const total = rankedStudents.length;
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      students: paginatedStudents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

