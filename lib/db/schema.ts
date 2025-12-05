import { pgTable, serial, text, varchar, timestamp, integer, uuid } from 'drizzle-orm/pg-core';

// Mock Interviews Table
export const mockInterviews = pgTable('mock_interviews', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Required: Clerk user ID for data isolation
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  jobDescription: text('job_description'),
  yearsOfExperience: integer('years_of_experience'),
  cvS3Path: varchar('cv_s3_path', { length: 500 }), // S3 path for uploaded CV
  cvFileName: varchar('cv_file_name', { length: 255 }), // Original filename
  jobDescriptionS3Path: varchar('job_description_s3_path', { length: 500 }), // S3 path for uploaded JD
  jobDescriptionFileName: varchar('job_description_file_name', { length: 255 }), // Original filename
  status: varchar('status', { length: 50 }).default('pending'), // pending, in_progress, completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Interview Sessions Table - to track actual interview conversations
export const interviewSessions = pgTable('interview_sessions', {
  id: serial('id').primaryKey(),
  mockInterviewId: integer('mock_interview_id').references(() => mockInterviews.id).notNull(),
  sessionId: varchar('session_id', { length: 255 }).notNull().unique(), // Unique session identifier
  conversationS3Path: varchar('conversation_s3_path', { length: 500 }), // S3 path for conversation JSON
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // Duration in seconds
  questionsAsked: integer('questions_asked').default(0),
  status: varchar('status', { length: 50 }).default('in_progress'), // in_progress, completed, abandoned
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports for TypeScript
export type MockInterview = typeof mockInterviews.$inferSelect;
export type NewMockInterview = typeof mockInterviews.$inferInsert;
export type InterviewSession = typeof interviewSessions.$inferSelect;
export type NewInterviewSession = typeof interviewSessions.$inferInsert;

