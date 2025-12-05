import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';
import { generateConversationId } from '@/lib/s3-storage';

const LLM_GATEWAY_URL = "https://llm-gateway.assemblyai.com/v1/chat/completions";

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer and career coach. Your role is to:
- Help users create compelling, professional cover letters
- Ask relevant questions about the job, company, and user's experience
- Provide conversational guidance and suggestions
- Make specific changes to the cover letter document
- Keep responses friendly, professional, and encouraging
- Focus on one aspect at a time for clarity

CRITICAL: You MUST ALWAYS respond with valid JSON in this exact format:
{
  "chat_response": "Your friendly, conversational response to the user",
  "document_updates": {
    "content": "Complete HTML content of the cover letter (use <br> for line breaks)",
    "sections": {
      "header": "Header section with contact info, date, employer info",
      "body": "Main body paragraphs of the cover letter",
      "closing": "Closing paragraph and signature"
    }
  }
}

RULES:
1. ALWAYS return valid JSON - no exceptions
2. If you don't have enough information, ask questions in chat_response and leave document_updates as empty strings
3. When updating the document, make sure all HTML is properly formatted with <br> tags for line breaks
4. Keep the tone professional but engaging
5. Focus on the user's specific experience and the job requirements

Guidelines for cover letters:
- Professional tone but show personality
- Address specific job requirements
- Highlight relevant skills and experiences
- Show knowledge of the company
- Clear call to action
- Keep to 3-4 paragraphs maximum

If this is the first interaction, start by asking about the job they're applying for and their relevant experience.`;

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
      message, 
      conversation_history,
      conversation_id,
      current_document
    } = await request.json();
    
    const apiKey = process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    // Prepare conversation history for the API
    const formattedHistory = (conversation_history || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    const messages = [
      { role: "system", content: COVER_LETTER_SYSTEM_PROMPT },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    const result = await axios.post(
      LLM_GATEWAY_URL,
      {
        model: "claude-haiku-4-5-20251001",
        messages,
        temperature: 0.7
      },
      { 
        headers: {
          authorization: apiKey,
          'content-type': 'application/json',
        }
      }
    );

    const aiResponse = result.data.choices[0].message.content;
    const convId = conversation_id || generateConversationId();
    const currentTime = new Date().toISOString();

    console.log('AI Response received:', aiResponse);

    // Parse the AI response - it should be JSON
    let parsedResponse;
    try {
      // Try to extract JSON from the response if it's wrapped in markdown or other formatting
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      parsedResponse = JSON.parse(jsonString);
      
      console.log('Successfully parsed AI response:', parsedResponse);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      console.log('Raw AI response:', aiResponse);
      
      // If not valid JSON, create a default response
      parsedResponse = {
        chat_response: "I apologize, but I encountered an issue formatting my response. Let me help you with your cover letter. What specific job are you applying for?",
        document_updates: current_document || {
          content: '',
          sections: { header: '', body: '', closing: '' }
        }
      };
    }

    // Update conversation history
    const updatedHistory = [
      ...(conversation_history || []),
      { role: 'user', content: message, timestamp: currentTime },
      { role: 'assistant', content: parsedResponse.chat_response, timestamp: currentTime }
    ];

    return NextResponse.json({ 
      chat_response: parsedResponse.chat_response,
      document_updates: parsedResponse.document_updates,
      conversation_id: convId,
      updated_history: updatedHistory
    });

  } catch (error) {
    console.error('Error with LLM Gateway API:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      return NextResponse.json(
        { error: 'LLM Gateway API error', details: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}