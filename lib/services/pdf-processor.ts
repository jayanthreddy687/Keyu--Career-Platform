import { extractText, getDocumentProxy } from 'unpdf';

/**
 * Extracts text content from a PDF buffer
 * @param pdfBuffer - Buffer containing PDF data
 * @returns Extracted text content from the PDF
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array as required by unpdf
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Load the PDF file into a PDF.js document
    const pdf = await getDocumentProxy(uint8Array);
    
    // Extract the text from the PDF file with merged pages
    const { text } = await extractText(pdf, { mergePages: true });
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Converts PDF to a structured text format suitable for LLM context
 * @param pdfBuffer - Buffer containing PDF data
 * @returns Formatted text representation of the resume
 */
export async function convertPdfToText(pdfBuffer: Buffer): Promise<string> {
  const extractedText = await extractTextFromPdf(pdfBuffer);
  
  // Clean up the text
  const cleanedText = extractedText
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
    .trim();
  
  return cleanedText;
}

/**
 * Formats resume content for inclusion in interview prompts
 * @param resumeText - Extracted resume text
 * @returns Formatted resume content for LLM prompt
 */
export function formatResumeForPrompt(resumeText: string): string {
  return `CANDIDATE'S RESUME:
${resumeText}

Use the information from this resume to ask relevant questions about the candidate's experience, skills, and background. Reference specific items from their resume when appropriate.`;
}

