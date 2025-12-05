import { InterviewCard } from './interview-card';
import { InterviewCardData } from '@/types/interview';

interface InterviewListProps {
  interviews: InterviewCardData[];
  onStartInterview: (id: number) => void;
  onMenuClick?: (id: number) => void;
}

export function InterviewList({ interviews, onStartInterview, onMenuClick }: InterviewListProps) {
  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No interviews found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {interviews.map((interview) => (
        <InterviewCard
          key={interview.id}
          interview={interview}
          onStart={onStartInterview}
          onMenuClick={onMenuClick}
        />
      ))}
    </div>
  );
}

