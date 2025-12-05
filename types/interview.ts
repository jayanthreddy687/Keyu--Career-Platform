// Interview types
export interface MockInterview {
  id: number;
  userId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string | null;
  yearsOfExperience: number | null;
  cvS3Path: string | null;
  cvFileName: string | null;
  jobDescriptionS3Path: string | null;
  jobDescriptionFileName: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface InterviewCardData {
  id: number;
  title: string;
  company: string;
  date: string;
  status: 'new' | 'in-progress' | 'completed';
}

export type InterviewStatus = 'pending' | 'in_progress' | 'completed';
export type DisplayStatus = 'new' | 'in-progress' | 'completed';

