import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from 'zod';
import { generateConversationId } from '@/lib/s3-storage';

// Define the structured output schema for the cover letter
const CoverLetterResponseSchema = z.object({
  chat_response: z.string().describe("Plain text conversational response to the user"),
  document_updates: z.object({
    content: z.string().describe("Complete HTML content of the cover letter (use <br> for line breaks)"),
    sections: z.object({
      header: z.string().describe("Header section with contact info, date, employer info"),
      body: z.string().describe("Main body paragraphs of the cover letter"),
      closing: z.string().describe("Closing paragraph and signature")
    })
  })
});

// Enhanced system prompt with best practices for concise, effective cover letters
const COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer and career coach specializing in creating compelling, concise cover letters that get results in 2025.

Your expertise includes:
- Writing ATS-optimized cover letters that pass screening systems
- Crafting problem-solution narratives that grab hiring manager attention
- Creating concise, impactful letters (250-400 words, 3-4 paragraphs max)
- Tailoring content to specific job requirements and company culture
- Highlighting quantifiable achievements and relevant skills

CRITICAL: You MUST ALWAYS respond with valid JSON in this exact format:
{
  "chat_response": "Your friendly, conversational response to the user (PLAIN TEXT ONLY - NO HTML)",
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
1. chat_response MUST be plain text only - NO HTML tags allowed
2. document_updates.content should be semantic HTML using <p> for paragraphs; minimize <br> usage to avoid extra line breaks
3. Keep cover letters to 250-400 words maximum (3-4 paragraphs)
4. Use problem-solution format when possible - identify company needs and show how you solve them
5. Include specific, quantifiable achievements with numbers/dollar amounts/percentages
6. Address the hiring manager by name when possible (research if needed)
7. Show genuine knowledge of the company and role
8. End with a clear, confident call to action

2025 COVER LETTER BEST PRACTICES:
- Hook immediately: Start with impact, not generic pleasantries
- Focus on value: What problems will you solve for them?
- Be specific: Use concrete examples and measurable results
- Show personality: Professional but authentic voice
- Keep it tight: Every word must earn its place
- Customize fully: No templates - each letter is unique

STRUCTURE GUIDE:
1. Opening: Grab attention immediately - mention a specific company challenge or your unique value proposition
2. Body: 1-2 paragraphs maximum - prove you can solve their problems with specific examples
3. Closing: Confident call to action - request interview, don't beg

If this is the first interaction, start by asking about:
- The specific job/company they're targeting
- Their most relevant achievement for this role
- Any specific company challenges they've identified

Focus on quality over quantity - one powerful example beats three generic paragraphs.

You can use the following cover letter template for writing the cover letter in HTML format:
\`\`\`
<!DOCTYPE html>
<html>
 
 <body style="font-family: Arial, sans-serif; margin: 0; font-size: 10pt;">
   <div class="cover-letter" style="padding: 20px;">
     <div class="header">
       <div style="font-size: 10pt;"><strong>Your Name</strong></div>
       <div style="font-size: 10pt;">Your Address | City, ST ZIP</div>
       <div style="font-size: 10pt;">Your Email | Your Phone</div>
       <div style="font-size: 10pt;"><a style="text-decoration: underline; color: blue; font-size: 10pt;" href="linkedin.com/in/username">LinkedIn</a></div>
       <br>
       <div style="font-size: 10pt;">[Current Date]</div><br><br>
       <div style="font-size: 10pt;"><strong>Hiring Manager Name</strong> (if known, otherwise "Hiring Team")</div>
       <div style="font-size: 10pt;">Company Name</div>
       <div style="font-size: 10pt;">Company Address</div>
       <div style="font-size: 10pt;">City, ST ZIP</div>
     </div>
     <br>
     <div class="body" style="margin-bottom: 20px; font-size: 10pt;">
       <p style="margin: 0 0 12px 0; font-size: 10pt;">Dear [Hiring Manager Name/Team],</p>
       <p style="margin: 0 0 12px 0; font-size: 10pt;">Opening paragraph: Hook immediately — mention a specific company challenge, recent achievement, or your unique value proposition. Show you've done your research about the company.</p>
       <p style="margin: 0 0 12px 0; font-size: 10pt;">Middle paragraph(s): Prove you can solve their problems. Include 1-2 specific examples of achievements with quantifiable results (numbers, percentages, dollar amounts). Connect your experience directly to their needs.</p>
       <p style="margin: 0 0 12px 0; font-size: 10pt;">Closing paragraph: Reiterate your enthusiasm and value. Include a confident call to action requesting an interview to discuss how you can contribute to their success.</p>
     </div>
     <div class="closing" style="margin-top: 20px; font-size: 10pt;">
       <p style="margin: 0 0 12px 0; font-size: 10pt;">Sincerely,</p>
       <div class="signature" style="font-size: 10pt;">
         <div style="font-size: 10pt;"><strong>Your Name</strong></div>
       </div>
     </div>
   </div>
 </body>
 
 </html>
\`\`\`

Remember to:
- Replace placeholders with actual information
- Keep paragraphs concise (3-5 sentences each)
- Use specific examples and quantifiable achievements
- Tailor content to the specific job and company
- Maintain professional but engaging tone`;

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
      conversation_id
    } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google API key is not configured' },
        { status: 500 }
      );
    }

    // Initialize the Google Gemini model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.7,
    });

    // Create structured output model
    const structuredModel = model.withStructuredOutput(CoverLetterResponseSchema, {
      method: "jsonSchema",
      includeRaw: false,
    });

    // Prepare conversation history for the model
    const formattedHistory = (conversation_history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'human' : 'ai',
      content: msg.content
    }));

    // Create the conversation context
    const conversationContext = formattedHistory.length > 0 
      ? formattedHistory.map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`).join('\n') + '\n'
      : '';

    const prompt = `${COVER_LETTER_SYSTEM_PROMPT}

Previous conversation:
${conversationContext}

Current user message: ${message}

Remember: chat_response must be plain text only, document_updates.content should be HTML formatted.`;

    // Get structured response from the model
    const response = await structuredModel.invoke([
      {
        role: "user",
        content: prompt
      }
    ]);

    const convId = conversation_id || generateConversationId();
    const currentTime = new Date().toISOString();

    console.log('AI Response received:', response);

    // Update conversation history
    const updatedHistory = [
      ...(conversation_history || []),
      { role: 'user', content: message, timestamp: currentTime },
      { role: 'assistant', content: response.chat_response, timestamp: currentTime }
    ];

    return NextResponse.json({ 
      chat_response: response.chat_response,
      document_updates: response.document_updates,
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