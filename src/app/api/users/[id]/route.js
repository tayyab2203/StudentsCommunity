import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import { calculateProfileCompletion } from '@/lib/profileCompletion';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const user = await User.findById(params.id).lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 403 }
      );
    }
    
    const projects = await Project.find({ studentId: params.id }).lean();
    
    return NextResponse.json({
      user,
      projects,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is updating their own profile
    if (user._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, category, semester, bio, image, availabilityStatus, role } = body;
    
    // Update fields
    if (name !== undefined) user.name = name;
    if (category !== undefined) user.category = category;
    if (semester !== undefined) user.semester = semester;
    if (bio !== undefined) user.bio = bio;
    if (image !== undefined) user.image = image;
    if (availabilityStatus !== undefined) user.availabilityStatus = availabilityStatus;
    
    // Allow role upgrade from VISITOR to STUDENT
    if (role === 'STUDENT' && user.role === 'VISITOR') {
      user.role = 'STUDENT';
    }
    
    // Calculate profile completion
    const projectCount = await Project.countDocuments({ studentId: user._id });
    user.profileCompletionPercent = calculateProfileCompletion(user, projectCount);
    
    await user.save();
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

