import { NextRequest, NextResponse } from 'next/server';
import { AccessControl, TRUSTED_USERS } from '@/lib/access-control';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd check if the user is an admin
    // For now, we'll return all users
    
    return NextResponse.json({
      success: true,
      users: AccessControl.getActiveUsers()
    });
  } catch (error) {
    console.error('Error fetching trusted users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trusted users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, accessLevel } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Add the user
    const success = AccessControl.addTrustedUser(
      email,
      name,
      role || 'beta',
      accessLevel || 1,
      'admin' // In a real app, get this from the authenticated user
    );

    if (!success) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Get the newly added user
    const newUser = AccessControl.getUserInfo(email);
    
    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User added successfully'
    });
  } catch (error) {
    console.error('Error adding trusted user:', error);
    return NextResponse.json(
      { error: 'Failed to add trusted user' },
      { status: 500 }
    );
  }
}
