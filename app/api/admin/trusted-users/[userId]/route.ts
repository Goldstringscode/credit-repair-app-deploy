import { NextRequest, NextResponse } from 'next/server';
import { AccessControl } from '@/lib/access-control';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Find the user by ID
    const user = AccessControl.getActiveUsers().find(u => u.id === userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove the user
    const success = AccessControl.removeTrustedUser(user.email);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    console.error('Error removing trusted user:', error);
    return NextResponse.json(
      { error: 'Failed to remove trusted user' },
      { status: 500 }
    );
  }
}
