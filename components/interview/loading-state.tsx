export function LoadingState() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
            <div className="h-9 w-[200px] bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 border border-border rounded-lg bg-card shadow-sm"
            >
              <div className="space-y-3">
                <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

