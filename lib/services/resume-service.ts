import { db } from '@/lib/db';
import { mockInterviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getObjectFromS3 } from '@/lib/s3-storage';
import { extractTextFromPdf, formatResumeForPrompt } from './pdf-processor';

/**
 * Fetches and processes resume content for a given interview
 * @param interviewId - The ID of the mock interview
 * @returns Processed resume content, or null if no resume exists
 */
export async function getResumeContent(
  interviewId: number
): Promise<string | null> {
  try {
    // Fetch the interview record from database
    const interview = await db
      .select()
      .from(mockInterviews)
      .where(eq(mockInterviews.id, interviewId))
      .limit(1);

    if (interview.length === 0 || !interview[0].cvS3Path) {
      console.log(`No resume found for interview ID: ${interviewId}`);
      return null;
    }

    const cvS3Path = interview[0].cvS3Path;

    // Download the PDF from S3
    console.log(`Downloading resume from S3: ${cvS3Path}`);
    const pdfBuffer = await getObjectFromS3(cvS3Path);

    // Extract text from PDF
    const content = await extractTextFromPdf(pdfBuffer);

    console.log(`Successfully extracted resume content (text)`);
    return content;

  } catch (error) {
    console.error('Error fetching resume content:', error);
    // Return null instead of throwing to make resume optional
    return null;
  }
}

/**
 * Fetches resume content formatted for LLM prompts
 * @param interviewId - The ID of the mock interview
 * @returns Formatted resume content for inclusion in prompts, or null if no resume
 */
export async function getResumeForPrompt(interviewId: number): Promise<string | null> {
  try {
    const resumeText = await getResumeContent(interviewId);
    
    if (!resumeText) {
      return null;
    }

    // Clean and format the resume text
    const cleanedText = resumeText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
      .trim();

    return formatResumeForPrompt(cleanedText);

  } catch (error) {
    console.error('Error formatting resume for prompt:', error);
    return null;
  }
}

