import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { generateConversationId } from '@/lib/s3-storage';
import { getResumeForPrompt } from '@/lib/services/resume-service';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

interface InterviewContext {
  jobTitle: string;
  companyName: string;
  jobDescription: string | null;
  yearsOfExperience: number | null;
}

const buildSystemPrompt = (
  interviewContext?: InterviewContext | null,
  resumeContent?: string | null,
  isInitialGreeting: boolean = false
): string => {
  let basePrompt = `You are an experienced professional recruiter conducting a job interview. Your role is to:
- Ask relevant, thoughtful questions about the candidate's experience, skills, and qualifications
- Follow up on interesting points the candidate makes
- Be conversational, professional, and encouraging
- Keep your responses brief (2-3 sentences max)
- Ask one question at a time
- Adapt your questions based on what the candidate tells you
- IMPORTANT: Once you learn the candidate's name, use it naturally throughout the conversation to make it more personal and engaging

This is a real-time conversation, so respond naturally as if speaking to the candidate.`;

  if (interviewContext) {
    basePrompt += `\n\nINTERVIEW CONTEXT:
- Position: ${interviewContext.jobTitle} at ${interviewContext.companyName}`;
    
    if (interviewContext.yearsOfExperience !== null) {
      basePrompt += `\n- Required Experience: ${interviewContext.yearsOfExperience} years`;
    }
    
    if (interviewContext.jobDescription) {
      basePrompt += `\n- Job Description: ${interviewContext.jobDescription}`;
    }

    basePrompt += `\n\nTailor your questions to assess the candidate's fit for this specific ${interviewContext.jobTitle} role at ${interviewContext.companyName}. Focus on skills and experiences relevant to this position.`;
  }

  // Add resume content if available
  if (resumeContent) {
    basePrompt += `\n\n${resumeContent}`;
  }

  // Special instruction for initial greeting
  if (isInitialGreeting) {
    basePrompt += `\n\nIMPORTANT: This is the START of the interview. Generate a warm, professional opening greeting that:
1. Welcomes the candidate
2. Mentions the position they're interviewing for (${interviewContext?.jobTitle || 'the position'})
3. ASK FOR THEIR NAME FIRST - This is critical. Start by asking "What's your name?" or "Could you tell me your name?"
4. Keep it brief (2 sentences max) and friendly

Do NOT ask any other questions yet - just welcome them and ask for their name.`;
  }

  return basePrompt;
};

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
      transcript_text, 
      conversation_history,
      conversation_id,
      interview_context,
      interview_id
    } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google API key is not configured' },
        { status: 500 }
      );
    }

    // Check if this is the initial greeting request
    const isInitialGreeting = transcript_text === "START_INTERVIEW" && 
                              (!conversation_history || conversation_history.length === 0);

    // Fetch resume content if interview_id is provided
    let resumeContent: string | null = null;
    if (interview_id) {
      try {
        resumeContent = await getResumeForPrompt(parseInt(interview_id));
        if (resumeContent) {
          console.log('Resume content:', resumeContent);
          console.log('Successfully fetched and formatted resume for interview');
        } else {
          console.log('No resume available for this interview');
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
        // Continue without resume if fetching fails
      }
    }

    // Build the system prompt with interview context, resume, and initial greeting flag
    const systemPrompt = buildSystemPrompt(interview_context, resumeContent, isInitialGreeting);

    // For initial greeting, use a generic prompt instead of actual transcript
    const userMessage = isInitialGreeting 
      ? "Please start the interview with a personalized greeting." 
      : transcript_text;

    // Initialize the Gemini model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.7,
      maxRetries: 2,
    });

    // Prepare conversation history for LangChain
    const messages = [
      new SystemMessage(systemPrompt),
      ...(conversation_history || []).map((msg: any) => 
        msg.role === 'user' 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
      new HumanMessage(userMessage)
    ];

    // Call the model
    const result = await model.invoke(messages);
    const aiResponse = result.content as string;

    const convId = conversation_id || generateConversationId();
    const currentTime = new Date().toISOString();

    const updatedHistory = [
      ...(conversation_history || []),
      { role: 'user', content: transcript_text, timestamp: currentTime },
      { role: 'assistant', content: aiResponse, timestamp: currentTime }
    ];

    return NextResponse.json({ 
      response: aiResponse,
      conversation_id: convId,
      updated_history: updatedHistory
    });

  } catch (error) {
    console.error('Error with Gemini API:', error);
    
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

