import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InterviewCardData } from "@/types/interview";

const DotsThreeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8.66667C8.36819 8.66667 8.66667 8.36819 8.66667 8C8.66667 7.63181 8.36819 7.33334 8 7.33334C7.63181 7.33334 7.33334 7.63181 7.33334 8C7.33334 8.36819 7.63181 8.66667 8 8.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.6667 8.66667C13.0349 8.66667 13.3333 8.36819 13.3333 8C13.3333 7.63181 13.0349 7.33334 12.6667 7.33334C12.2985 7.33334 12 7.63181 12 8C12 8.36819 12.2985 8.66667 12.6667 8.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.33333 8.66667C3.70152 8.66667 4 8.36819 4 8C4 7.63181 3.70152 7.33334 3.33333 7.33334C2.96514 7.33334 2.66666 7.63181 2.66666 8C2.66666 8.36819 2.96514 8.66667 3.33333 8.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.33334 2.5L12.6667 8L3.33334 13.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface InterviewCardProps {
  interview: InterviewCardData;
  onStart: (id: number) => void;
  onMenuClick?: (id: number) => void;
}

export function InterviewCard({ interview, onStart, onMenuClick }: InterviewCardProps) {
  const { id, title, company, date, status } = interview;

  const statusConfig = {
    new: {
      label: 'New',
      className: 'bg-blue-100 text-blue-800',
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-amber-100 text-amber-800',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="p-4 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-card-foreground truncate">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{company}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={() => onMenuClick?.(id)}
        >
          <DotsThreeIcon />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mb-3">{date}</div>

      <div className="flex justify-between items-center">
        <div
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            currentStatus.className
          )}
        >
          {currentStatus.label}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onStart(id)}
        >
          <PlayIcon />
          <span>Start</span>
        </Button>
      </div>
    </div>
  );
}

