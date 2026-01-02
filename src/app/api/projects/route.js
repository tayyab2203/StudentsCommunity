import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { calculateProfileCompletion } from '@/lib/profileCompletion';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }
    
    const projects = await Project.find({ studentId }).lean();
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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
    
    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can create projects' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, liveLink } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const project = await Project.create({
      title,
      description: description || '',
      liveLink: liveLink || '',
      studentId: user._id,
    });
    
    // Update profile completion
    const projectCount = await Project.countDocuments({ studentId: user._id });
    user.profileCompletionPercent = calculateProfileCompletion(user, projectCount);
    await user.save();
    
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

