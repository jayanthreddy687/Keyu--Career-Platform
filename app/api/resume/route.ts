import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';
import { generateConversationId } from '@/lib/s3-storage';

const LLM_GATEWAY_URL = "https://llm-gateway.assemblyai.com/v1/chat/completions";

const RESUME_SYSTEM_PROMPT = `You are an expert resume writer and career coach specializing in ATS (Applicant Tracking System) optimization. Your role is to:
- Help users create compelling, ATS-friendly resumes
- Ask relevant questions about the job, company, and user's experience
- Provide conversational guidance and suggestions
- Make specific changes to the resume document
- Keep responses friendly, professional, and encouraging
- Focus on one aspect at a time for clarity
- Ensure the resume is optimized for ATS systems

CRITICAL: You MUST ALWAYS respond with valid JSON in this exact format:
{
  "chat_response": "Your friendly, conversational response to the user",
  "document_updates": {
    "content": "Complete HTML content of the resume",
    "sections": {
      "header": "Header section with name, contact info, LinkedIn, etc.",
      "summary": "Professional summary or objective statement",
      "experience": "Work experience section with job titles, companies, dates, and achievements",
      "education": "Education section with degrees, schools, and dates",
      "skills": "Skills section with technical and soft skills"
    }
  }
}

RULES:
1. ALWAYS return valid JSON - no exceptions
2. If you don't have enough information, ask questions in chat_response and leave document_updates as empty strings
3. When updating the document, make sure all HTML is properly formatted with <br> tags for line breaks
4. Keep the tone professional but engaging
5. Focus on the user's specific experience and the job requirements
6. Use ATS-friendly formatting and keywords
7. Keep the name and the job title in the top middle of the document.
8. Use 12 font size for title of each section. For eg: "Summary", "Experience", "Education", "Skills".
9. Use 10 font size for the body of each section.
10. Add dividers after each section using <hr> tag.
11. Use <br> for line breaks.

Guidelines for ATS-friendly resumes:
- Use standard section headers (Summary, Experience, Education, Skills)
- The summary should not be more than 2-5 sentences (50-70 words)
- Include relevant keywords from the job description
- Use bullet points for achievements and responsibilities
- Quantify achievements with numbers and metrics when possible
- Keep formatting simple and clean
- Use standard fonts and avoid complex layouts
- Include both technical and soft skills
- Tailor content to the specific job being applied for

You can use the following resume template for writing the resume in html format:
\`\`\`
<!DOCTYPE html>
<html>
  <body>
    <div class="resume" style="max-width:800px;color:#000;">
      <div class="contact" style="text-align:center;margin-bottom:8px;">
        <h1 style="font-size:20px;margin:0;">Full Name</h1>
        <div style="font-size:12px;">City, ST | email@example.com | (555) 555-5555 | <a style="text-decoration: underline; color: blue" href="linkedin.com/in/username">LinkedIn</a></div>
      </div>
      <h2 style="font-size:12px;margin:12px 0 6px;">Summary</h2>
      <div style="font-size:10px;margin-bottom:8px;">[profile summary tailored to the job description or the role. The summary should be no longer than 300-400 characters]</div>
      
      <hr>
      <h2 style="font-size:12px;margin:12px 0 6px;">Experience</h2>
      <div style="font-size:10px;margin-bottom:8px;">
        <div><strong>Job Title</strong> - Location | MM/YYYY - MM/YYYY</div>
        <ul style="margin:6px 0 10px 16px;">
          <li>Implemented X using Y, increasing Z by 25%</li>
          <li>Led A to deliver B under budget by 15%</li>
        </ul>
      </div>
      <hr>
      <h2 style="font-size:12px;margin:12px 0 6px;">Projects (if any)</h2>
      <div style="font-size:10px;margin-bottom:8px;">[description of the project with skill/experience gained]</div>
      <hr>
      <h2 style="font-size:12px;margin:12px 0 6px;">Education</h2>
      <div style="font-size:10px;margin-bottom:8px;">Degree, Major - School | MM/YYYY - MM/YYYY | [Grade if provided]</div>
      <hr>
      <h2 style="font-size:12px;margin:12px 0 6px;">Skills</h2>
      <div style="font-size:10px;margin-bottom:8px;">
      <span>Skill 1</span>
      <span>•</span>
      <span>Skill 2</span>
      <span>•</span>
      <span>Skill 3</span>
      </div>
      <hr>
    </div>
  </body>
  </html>
  
\`\`\`

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
      { role: "system", content: RESUME_SYSTEM_PROMPT },
      ...formattedHistory,
      { role: "user", content: message }
    ];

    const result = await axios.post(
      LLM_GATEWAY_URL,
      {
        model: "gpt-5-mini",
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
        chat_response: "I apologize, but I encountered an issue formatting my response. Let me help you with your resume. What specific job are you applying for and what is your relevant experience?",
        document_updates: current_document || {
          content: '',
          sections: { header: '', summary: '', experience: '', education: '', skills: '' }
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