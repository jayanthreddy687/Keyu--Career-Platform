import { useState, useEffect, useCallback } from 'react';
import { MockInterview } from '@/types/interview';

interface UseInterviewsReturn {
  interviews: MockInterview[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInterviews(): UseInterviewsReturn {
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mock-interview', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch interviews');
      }

      setInterviews(result.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching interviews';
      setError(errorMessage);
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  return {
    interviews,
    loading,
    error,
    refetch: fetchInterviews,
  };
}

