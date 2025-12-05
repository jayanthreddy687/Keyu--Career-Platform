import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadConversationToS3, type ConversationData } from '@/lib/s3-storage';

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

    const { 
      conversation_id,
      conversation_history,
      metadata 
    } = await request.json();

    if (!conversation_id) {
      return NextResponse.json(
        { error: 'conversation_id is required' },
        { status: 400 }
      );
    }

    if (!conversation_history || conversation_history.length === 0) {
      return NextResponse.json(
        { error: 'conversation_history is required' },
        { status: 400 }
      );
    }

    const currentTime = new Date().toISOString();
    
    const conversationData: ConversationData = {
      conversationId: conversation_id,
      startTime: conversation_history[0]?.timestamp || currentTime,
      lastUpdated: currentTime,
      messages: conversation_history,
      metadata: {
        interviewType: 'ai-interview',
        userId, // Include the authenticated user's ID
        ...metadata
      }
    };

    const s3Key = await uploadConversationToS3(conversationData);

    return NextResponse.json({ 
      success: true,
      s3Key,
      message: 'Conversation saved successfully'
    });

  } catch (error) {
    console.error('Error saving conversation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

