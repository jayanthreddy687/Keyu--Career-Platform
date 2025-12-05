import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2.66666 17.3333V16C2.66666 8.63621 8.63621 2.66666 16 2.66666C23.3638 2.66666 29.3333 8.63621 29.3333 16V17.3333M2.66666 17.3333C2.66666 17.3333 2.66666 25.3333 6.66666 25.3333C10.6667 25.3333 10.6667 17.3333 10.6667 17.3333M2.66666 17.3333H4M29.3333 17.3333C29.3333 17.3333 29.3333 25.3333 25.3333 25.3333C21.3333 25.3333 21.3333 17.3333 21.3333 17.3333M29.3333 17.3333H28M10.6667 17.3333H21.3333M12 25.3333V28C12 28.7364 12.597 29.3333 13.3333 29.3333H18.6667C19.403 29.3333 20 28.7364 20 28V25.3333"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first practice interview to prepare for your next job opportunity.
      </p>
      <Button onClick={onCreateNew}>Create New Interview</Button>
    </div>
  );
}

