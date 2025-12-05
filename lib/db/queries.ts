import { db } from './index';
import { mockInterviews, interviewSessions, type NewMockInterview, type NewInterviewSession } from './schema';
import { eq, desc } from 'drizzle-orm';

// Mock Interview Queries
export async function createMockInterview(data: NewMockInterview) {
  const result = await db.insert(mockInterviews).values(data).returning();
  return result[0];
}

export async function getMockInterviewById(id: number) {
  const result = await db.select().from(mockInterviews).where(eq(mockInterviews.id, id)).limit(1);
  return result[0] || null;
}

export async function getMockInterviewsByUserId(userId: string) {
  return await db.select().from(mockInterviews)
    .where(eq(mockInterviews.userId, userId))
    .orderBy(desc(mockInterviews.createdAt));
}

export async function getAllMockInterviews() {
  return await db.select().from(mockInterviews).orderBy(desc(mockInterviews.createdAt));
}

export async function updateMockInterviewStatus(id: number, status: string) {
  const result = await db.update(mockInterviews)
    .set({ status, updatedAt: new Date() })
    .where(eq(mockInterviews.id, id))
    .returning();
  return result[0];
}

// Interview Session Queries
export async function createInterviewSession(data: NewInterviewSession) {
  const result = await db.insert(interviewSessions).values(data).returning();
  return result[0];
}

export async function getInterviewSessionById(id: number) {
  const result = await db.select().from(interviewSessions).where(eq(interviewSessions.id, id)).limit(1);
  return result[0] || null;
}

export async function getInterviewSessionBySessionId(sessionId: string) {
  const result = await db.select().from(interviewSessions).where(eq(interviewSessions.sessionId, sessionId)).limit(1);
  return result[0] || null;
}

export async function getInterviewSessionsByMockInterviewId(mockInterviewId: number) {
  return await db.select().from(interviewSessions)
    .where(eq(interviewSessions.mockInterviewId, mockInterviewId))
    .orderBy(desc(interviewSessions.startedAt));
}

export async function updateInterviewSession(
  sessionId: string,
  data: Partial<NewInterviewSession>
) {
  const result = await db.update(interviewSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(interviewSessions.sessionId, sessionId))
    .returning();
  return result[0];
}

export async function completeInterviewSession(
  sessionId: string,
  conversationS3Path: string,
  questionsAsked: number,
  duration: number
) {
  const result = await db.update(interviewSessions)
    .set({
      conversationS3Path,
      questionsAsked,
      duration,
      completedAt: new Date(),
      status: 'completed',
      updatedAt: new Date(),
    })
    .where(eq(interviewSessions.sessionId, sessionId))
    .returning();
  return result[0];
}

