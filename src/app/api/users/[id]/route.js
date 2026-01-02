import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import { calculateProfileCompletion } from '@/lib/profileCompletion';
import { calculateSkillMatchScore } from '@/lib/skillMatch';

export async function GET(request, { params }) {
  try {
    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = params && typeof params.then === 'function' ? await params : params;
    
    await connectDB();
    
    const user = await User.findById(resolvedParams.id).lean();
    
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
    
    const projects = await Project.find({ studentId: resolvedParams.id }).lean();
    
    // Calculate skill match if viewer is logged in
    let skillMatch = 0;
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const viewer = await User.findById(session.user.id).lean();
      if (viewer) {
        skillMatch = calculateSkillMatchScore(viewer, user);
      }
    }
    
    return NextResponse.json({
      user,
      projects,
      skillMatch,
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
    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = params && typeof params.then === 'function' ? await params : params;
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Try to find user by ID first, if not found, try by email (for new users)
    let user = await User.findById(resolvedParams.id);
    
    // If user not found by ID, try to find by session user ID or email
    if (!user) {
      user = await User.findOne({ 
        $or: [
          { _id: session.user.id },
          { email: session.user.email }
        ]
      });
      
      // If still not found, create a new user (shouldn't happen but handle gracefully)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found. Please sign in again.' },
          { status: 404 }
        );
      }
    }
    
    // Check if user is updating their own profile
    if (user._id.toString() !== session.user.id && user.email !== session.user.email) {
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
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

