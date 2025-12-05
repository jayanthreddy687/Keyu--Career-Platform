import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { mockInterviews } from '@/lib/db/schema';
import { uploadDocumentToS3 } from '@/lib/s3-storage';
import { eq, desc } from 'drizzle-orm';

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

    const formData = await request.formData();
    
    const jobTitle = formData.get('jobTitle') as string;
    const companyName = formData.get('companyName') as string;
    const jobDescription = formData.get('jobDescription') as string;
    const yearsOfExperience = formData.get('yearsOfExperience') as string;
    const cvFile = formData.get('cv') as File | null;
    const jobDescriptionFile = formData.get('jobDescriptionFile') as File | null;

    // Validate required fields
    if (!jobTitle || !companyName) {
      return NextResponse.json(
        { error: 'Job title and company name are required' },
        { status: 400 }
      );
    }

    let cvS3Path: string | null = null;
    let cvFileName: string | null = null;
    let jobDescriptionS3Path: string | null = null;
    let jobDescriptionFileName: string | null = null;

    // Upload CV to S3 if provided
    if (cvFile && cvFile.size > 0) {
      try {
        const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
        cvS3Path = await uploadDocumentToS3(
          cvBuffer,
          cvFile.name,
          cvFile.type,
          'cvs'
        );
        cvFileName = cvFile.name;
      } catch (error) {
        console.error('Error uploading CV to S3:', error);
        return NextResponse.json(
          { error: 'Failed to upload CV' },
          { status: 500 }
        );
      }
    }

    // Upload Job Description file to S3 if provided
    if (jobDescriptionFile && jobDescriptionFile.size > 0) {
      try {
        const jdBuffer = Buffer.from(await jobDescriptionFile.arrayBuffer());
        jobDescriptionS3Path = await uploadDocumentToS3(
          jdBuffer,
          jobDescriptionFile.name,
          jobDescriptionFile.type,
          'job-descriptions'
        );
        jobDescriptionFileName = jobDescriptionFile.name;
      } catch (error) {
        console.error('Error uploading job description to S3:', error);
        return NextResponse.json(
          { error: 'Failed to upload job description file' },
          { status: 500 }
        );
      }
    }

    // Insert into database with the authenticated user's ID
    const result = await db.insert(mockInterviews).values({
      userId: userId,
      jobTitle,
      companyName,
      jobDescription: jobDescription || null,
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
      cvS3Path: cvS3Path || null,
      cvFileName: cvFileName || null,
      jobDescriptionS3Path: jobDescriptionS3Path || null,
      jobDescriptionFileName: jobDescriptionFileName || null,
      status: 'pending',
    }).returning();

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Mock interview created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating mock interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user's ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single interview by ID, but only if it belongs to the current user
      const interview = await db
        .select()
        .from(mockInterviews)
        .where(eq(mockInterviews.id, parseInt(id)))
        .limit(1);
      
      if (interview.length === 0) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        );
      }

      // Verify the interview belongs to the current user
      if (interview[0].userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized. You do not have access to this interview.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: interview[0],
      });
    } else {
      // Get all interviews for the authenticated user only
      const interviews = await db
        .select()
        .from(mockInterviews)
        .where(eq(mockInterviews.userId, userId))
        .orderBy(desc(mockInterviews.createdAt));
      
      return NextResponse.json({
        success: true,
        data: interviews,
      });
    }
  } catch (error) {
    console.error('Error fetching mock interviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

