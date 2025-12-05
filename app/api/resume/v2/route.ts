import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import { generateConversationId } from '@/lib/s3-storage';

// Define the structured output schema using Zod
const ResumeResponseSchema = z.object({
  chat_response: z.string().describe("Your friendly, conversational response to the user"),
  document_updates: z.object({
    content: z.string().describe("Complete HTML content of the resume"),
    sections: z.object({
      header: z.string().describe("Header section with name, contact info, LinkedIn, etc."),
      summary: z.string().describe("Professional summary or objective statement"),
      experience: z.string().describe("Work experience section with job titles, companies, dates, and achievements"),
      education: z.string().describe("Education section with degrees, schools, and dates"),
      skills: z.string().describe("Skills section with technical and soft skills")
    })
  })
});

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
  "chat_response": "Your friendly, conversational response to the user (MUST be plain text - NO HTML tags allowed)",
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
2. The chat_response field MUST contain only plain text - NO HTML tags, formatting, or special characters allowed
3. If you don't have enough information, ask questions in chat_response and leave document_updates as empty strings
4. When updating the document, make sure all HTML is properly formatted with <br> tags for line breaks
5. Keep the tone professional but engaging
6. Focus on the user's specific experience and the job requirements
7. Use ATS-friendly formatting and keywords
8. Keep the name and the job title in the top middle of the document.
9. Use 12 font size for title of each section. For eg: "Summary", "Experience", "Education", "Skills".
10. Use 10 font size for the body of each section.
11. Add dividers after each section using <hr> tag.
12. Use <br> for line breaks.
13. In the contact section, always include LinkedIn link if provided by the user. Only include GitHub and portfolio links if the user has specifically provided them. Use the pipe separator (|) between contact elements.

SECTION ORDERING GUIDELINES:

For most job seekers (standard order):
1. Contact information (always first) - name, phone, email, LinkedIn
2. Resume summary (2-5 sentences, 50-70 words)
3. Work experience (core of resume, most prominent)
4. Education (below work experience for experienced professionals)
5. Skills and certifications (bottom section)

For recent graduates:
1. Contact information
2. Education (showcase upfront as strongest asset)
3. Work experience (including internships, part-time jobs)
4. Activities/awards (if applicable)
5. Skills

For career changers:
1. Contact information
2. Resume summary (explain career change context)
3. Skills (move up to show relevant background)
4. Relevant experience (most relevant first)
5. Additional experience (other recent jobs)
6. Education

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
    <div class="resume">
      <div class="contact" style="text-align:center;margin-bottom:8px;">
        <h1 style="font-size:20pt;margin:0;font-weight:bold;">[Fullname]</h1>
        <div style="font-size:10pt;">City, ST | email@example.com | (555) 555-5555 | <a style="text-decoration: underline; color: blue" href="linkedin.com/in/username">LinkedIn</a> | <a style="text-decoration: underline; color: blue" href="github.com/username">GitHub</a> | <a style="text-decoration: underline; color: blue" href="portfolio.com">Portfolio</a></div>
      </div>
      <h2 style="font-size:12pt;margin:12px 0 6px;text-align:center;font-weight:bold;">SUMMARY</h2>
      <div style="font-size:10pt;margin-bottom:8px;">[profile summary tailored to the job description or the role. The summary should be no longer than 300-400 characters]</div>
      
      <hr>
      <h2 style="font-size:12pt;margin:12px 0 6px;text-align:center;font-weight:bold;">EXPERIENCE</h2>
      <div style="font-size:10pt;margin-bottom:8px;">
        <div><strong>Job Title</strong> - Location | MM/YYYY - MM/YYYY</div>
        <ul style="margin:6px 0 10px 16px;">
          <li>Implemented X using Y, increasing Z by 25%</li>
          <li>Led A to deliver B under budget by 15%</li>
        </ul>
      </div>
      <hr>
      <h2 style="font-size:12pt;margin:12px 0 6px;text-align:center;font-weight:bold;">PROJECTS (if any)</h2>
      <div class="projects" style="font-size:10pt;margin-bottom:8px;">[description of the project with skill/experience gained]</div>
      <hr>
      <h2 style="font-size:12pt;margin:12px 0 6px;text-align:center;font-weight:bold;">EDUCATION</h2>
      <div class="education" style="font-size:10pt;margin-bottom:8px;">Degree, Major - School | MM/YYYY - MM/YYYY | [Grade if provided]</div>
      <hr>
      <h2 style="font-size:12pt;margin:12px 0 6px;text-align:center;font-weight:bold;">SKILLS</h2>
      <div class="skills" style="font-size:10pt;margin-bottom:8px;">
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

If this is the first interaction, start by asking about the job they're applying for and their relevant experience. Also ask for their LinkedIn profile link (required), and optionally GitHub and portfolio links if they have them. If they don't have any links, proceed with making the resume. Only include links that the user has provided.`;

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

    // Initialize the Gemini model with structured output
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.7,
      maxRetries: 2,
    });

    // Configure the model to use structured output
    const structuredModel = model.withStructuredOutput(ResumeResponseSchema, {
      method: "jsonSchema",
      includeRaw: false,
    });

    // Prepare conversation history for the model
    const formattedHistory = (conversation_history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Create the conversation messages
    const messages = [
      { role: "system", content: RESUME_SYSTEM_PROMPT },
      ...formattedHistory,
      { role: "human", content: message }
    ];

    // Call the model with structured output
    const result = await structuredModel.invoke(messages);
    
    const convId = conversation_id || generateConversationId();
    const currentTime = new Date().toISOString();

    console.log('AI Response received:', result);

    // Update conversation history
    const updatedHistory = [
      ...(conversation_history || []),
      { role: 'user', content: message, timestamp: currentTime },
      { role: 'assistant', content: result.chat_response, timestamp: currentTime }
    ];

    return NextResponse.json({ 
      chat_response: result.chat_response,
      document_updates: result.document_updates,
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