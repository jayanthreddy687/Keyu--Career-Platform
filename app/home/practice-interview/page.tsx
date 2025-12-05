'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInterviews } from '@/lib/hooks/useInterviews';
import { filterInterviews, sortInterviewsByDate, transformToCardData } from '@/lib/utils/interview';
import { InterviewList } from '@/components/interview/interview-list';
import { EmptyState } from '@/components/interview/empty-state';
import { LoadingState } from '@/components/interview/loading-state';
import { ErrorState } from '@/components/interview/error-state';

// SVG Icons
const MagnifyingGlassIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.6667 14.6667L10.4373 10.4373M10.4373 10.4373C11.4731 9.40159 12.0001 7.9732 12.0001 6.50004C12.0001 5.02688 11.4731 3.59849 10.4373 2.56274C9.40159 1.52699 7.9732 1 6.50004 1C5.02688 1 3.59849 1.52699 2.56274 2.56274C1.52699 3.59849 1 5.02688 1 6.50004C1 7.9732 1.52699 9.40159 2.56274 10.4373C3.59849 11.4731 5.02688 12.0001 6.50004 12.0001C7.9732 12.0001 9.40159 11.4731 10.4373 10.4373Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CaretUpDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.33333 10L8 12.6667L10.6667 10M5.33333 6L8 3.33333L10.6667 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PracticeInterviewPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom hook to fetch interviews with loading and error states
  const { interviews, loading, error, refetch } = useInterviews();

  // Memoized filtered and sorted interviews
  const processedInterviews = useMemo(() => {
    const filtered = filterInterviews(interviews, searchQuery);
    const sorted = sortInterviewsByDate(filtered);
    return sorted.map(transformToCardData);
  }, [interviews, searchQuery]);

  const handleCreateNew = () => {
    window.dispatchEvent(new CustomEvent('open-create-new-dialog'));
  };

  const handleStartInterview = (id: number) => {
    router.push(`/home/practice-interview/${id}`);
  };

  const handleMenuClick = (id: number) => {
    // TODO: Implement menu actions (edit, delete, etc.)
    console.log('Menu clicked for interview:', id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-1 h-full bg-sidebar">
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl border border-gray-200">
          <div className="flex items-center border-b border-gray-200 px-2 h-12">
            <p className="text-sm"><span className="font-semibold">Practice Interview</span></p>
          </div>
          <LoadingState />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-1 h-full bg-sidebar">
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl border border-gray-200">
          <div className="flex items-center border-b border-gray-200 px-2 h-12">
            <p className="text-sm"><span className="font-semibold">Practice Interview</span></p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ErrorState message={error} onRetry={refetch} />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (interviews.length === 0) {
    return (
      <div className="p-1 h-full bg-sidebar">
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl border border-gray-200">
          <div className="flex items-center border-b border-gray-200 px-2 h-12">
            <p className="text-sm"><span className="font-semibold">Practice Interview</span></p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <EmptyState onCreateNew={handleCreateNew} />
          </div>
        </div>
      </div>
    );
  }

  // Main content with interviews
  return (
    <div className="p-1 h-full bg-sidebar">
      <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl border border-gray-200">
        <div className="flex items-center border-b border-gray-200 px-2 h-12">
          <p className="text-sm"><span className="font-semibold">Practice Interview</span></p>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              All Interviews
              <span className="ml-2 text-sm text-muted-foreground">
                ({interviews.length})
              </span>
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" disabled>
                <span>Sort</span>
                <CaretUpDownIcon />
              </Button>
              <div className="relative">
                <Input
                  placeholder="Search interviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-[200px] pr-8"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <MagnifyingGlassIcon />
                </div>
              </div>
            </div>
          </div>
          
          <InterviewList
            interviews={processedInterviews}
            onStartInterview={handleStartInterview}
            onMenuClick={handleMenuClick}
          />
        </div>
      </div>
      </div>
    </div>
  );
}