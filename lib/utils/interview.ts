import { MockInterview, InterviewCardData, DisplayStatus } from '@/types/interview';

/**
 * Converts database status to display status
 */
export function mapStatusToDisplay(status: string): DisplayStatus {
  switch (status) {
    case 'pending':
      return 'new';
    case 'in_progress':
      return 'in-progress';
    case 'completed':
      return 'completed';
    default:
      return 'new';
  }
}

/**
 * Formats a date string to a readable format
 */
export function formatInterviewDate(dateString: string): string {
  const date = new Date(dateString);
  return `Created on ${date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`;
}

/**
 * Transforms a MockInterview to InterviewCardData for display
 */
export function transformToCardData(interview: MockInterview): InterviewCardData {
  return {
    id: interview.id,
    title: interview.jobTitle,
    company: interview.companyName,
    date: formatInterviewDate(interview.createdAt),
    status: mapStatusToDisplay(interview.status),
  };
}

/**
 * Filters interviews by search query
 */
export function filterInterviews(
  interviews: MockInterview[],
  searchQuery: string
): MockInterview[] {
  if (!searchQuery.trim()) {
    return interviews;
  }

  const query = searchQuery.toLowerCase();
  return interviews.filter(
    (interview) =>
      interview.jobTitle.toLowerCase().includes(query) ||
      interview.companyName.toLowerCase().includes(query)
  );
}

/**
 * Sorts interviews by creation date (newest first)
 */
export function sortInterviewsByDate(interviews: MockInterview[]): MockInterview[] {
  return [...interviews].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

