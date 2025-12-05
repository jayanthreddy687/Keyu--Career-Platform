import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user's ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // TODO: Implement resume extraction functionality
    return NextResponse.json(
      { 
        error: 'This endpoint is not yet implemented',
        message: 'Resume extraction feature coming soon'
      },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error in extract-resume endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

