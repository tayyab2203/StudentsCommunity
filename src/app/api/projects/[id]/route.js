import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { calculateProfileCompletion } from '@/lib/profileCompletion';

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
    
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the project
    if (project.studentId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, liveLink } = body;
    
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (liveLink !== undefined) project.liveLink = liveLink;
    
    await project.save();
    
    // Update profile completion
    const user = await User.findById(session.user.id);
    if (user) {
      const projectCount = await Project.countDocuments({ studentId: user._id });
      user.profileCompletionPercent = calculateProfileCompletion(user, projectCount);
      await user.save();
    }
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the project
    if (project.studentId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    await Project.findByIdAndDelete(params.id);
    
    // Update profile completion
    const user = await User.findById(session.user.id);
    if (user) {
      const projectCount = await Project.countDocuments({ studentId: user._id });
      user.profileCompletionPercent = calculateProfileCompletion(user, projectCount);
      await user.save();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

