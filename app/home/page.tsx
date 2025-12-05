'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// SVG Icons
function HeadsetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.33334 8.66667V8C1.33334 6.23189 2.03572 4.53619 3.28596 3.28595C4.5362 2.03571 6.2319 1.33333 8.00001 1.33333C9.76811 1.33333 11.4638 2.03571 12.7141 3.28595C13.9643 4.53619 14.6667 6.23189 14.6667 8V8.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.6667 11.3333V12.6667C14.6667 13.0203 14.5262 13.3594 14.2762 13.6095C14.0261 13.8595 13.687 14 13.3333 14H12.6667C12.313 14 11.9739 13.8595 11.7239 13.6095C11.4738 13.3594 11.3333 13.0203 11.3333 12.6667V9.33333C11.3333 8.97971 11.4738 8.64057 11.7239 8.39052C11.9739 8.14048 12.313 8 12.6667 8H14.6667V11.3333ZM1.33334 11.3333V12.6667C1.33334 13.0203 1.47382 13.3594 1.72387 13.6095C1.97392 13.8595 2.31305 14 2.66668 14H3.33334C3.68697 14 4.0261 13.8595 4.27615 13.6095C4.5262 13.3594 4.66668 13.0203 4.66668 12.6667V9.33333C4.66668 8.97971 4.5262 8.64057 4.27615 8.39052C4.0261 8.14048 3.68697 8 3.33334 8H1.33334V11.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33334 1.33333H4.00001C3.64638 1.33333 3.30724 1.47381 3.0572 1.72386C2.80715 1.9739 2.66668 2.31304 2.66668 2.66666V13.3333C2.66668 13.687 2.80715 14.0261 3.0572 14.2761C3.30724 14.5262 3.64638 14.6667 4.00001 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2761C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V5.33333L9.33334 1.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.33334 1.33333V5.33333H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.6667 8.66667H5.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.6667 11.3333H5.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.66668 6H5.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CaretUpDownIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4.66667 10L8 13.3333L11.3333 10M4.66667 6L8 2.66667L11.3333 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MagnifyingGlassIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M14.6667 14.6667L10.4373 10.4373M10.4373 10.4373C11.4129 9.46177 12 8.1188 12 6.66667C12 3.76243 9.6376 1.33334 6.66667 1.33334C3.69573 1.33334 1.33333 3.69573 1.33333 6.66667C1.33333 9.6376 3.76243 12 6.66667 12C8.1188 12 9.46177 11.4129 10.4373 10.4373Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showContent, setShowContent] = useState(true); // Toggle between empty and content-loaded states
  
  return (
    <div className="p-1 h-full bg-sidebar">
      <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl border border-gray-200">
        <div className="flex items-center border-b border-gray-200 px-2 h-12">
          <p className="text-sm"><span className="font-semibold">My Projects</span></p>
        </div>

      
      <div className="flex-1 overflow-auto p-6">
        {!showContent ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold mb-2">No content yet</h2>
              <p className="text-muted-foreground mb-4">Create your first resume or practice interview</p>
              <Button onClick={() => window.dispatchEvent(new CustomEvent('open-create-new-dialog'))}>Create New</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                All Projects
                <span className="ml-2 text-sm text-muted-foreground">
                  (4)
                </span>
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" disabled>
                  <span>Sort</span>
                  <CaretUpDownIcon />
                </Button>
                <div className="relative">
                  <Input
                    placeholder="Search projects..."
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* AI Mock Interview Cards */}
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-border/80 transition-all group cursor-pointer">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <HeadsetIcon />
                  </div>
                  <span className="font-medium">AI Mock Interview</span>
                </div>
                <div className="text-xs text-muted-foreground">2 days ago</div>
              </div>
              <h3 className="font-medium mb-1">Frontend Developer</h3>
              <div className="flex items-center justify-between">
                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label="More options"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.33334V12.6667M3.33333 8.00001H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <HeadsetIcon />
                  </div>
                  <span className="font-medium">AI Mock Interview</span>
                </div>
                <div className="text-xs text-muted-foreground">1 week ago</div>
              </div>
              <h3 className="font-medium mb-1">Product Manager</h3>
              <div className="flex items-center justify-between">
                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label="More options"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.33334V12.6667M3.33333 8.00001H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Resume Cards */}
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <ResumeIcon />
                  </div>
                  <span className="font-medium">Resume</span>
                </div>
                <div className="text-xs text-muted-foreground">3 days ago</div>
              </div>
              <h3 className="font-medium mb-1">Software Engineer</h3>
              <div className="flex items-center justify-between">
                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">Draft</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label="More options"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.33334V12.6667M3.33333 8.00001H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <ResumeIcon />
                  </div>
                  <span className="font-medium">Resume</span>
                </div>
                <div className="text-xs text-muted-foreground">2 weeks ago</div>
              </div>
              <h3 className="font-medium mb-1">UX Designer</h3>
              <div className="flex items-center justify-between">
                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label="More options"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.33334V12.6667M3.33333 8.00001H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
            </div>
          </div>
          
          {/* Toggle button for demo purposes - can be removed in production */}
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowContent(!showContent)}
              className="text-xs"
            >
              Toggle {showContent ? 'Empty' : 'Content'} State
            </Button>
          </div>
        </div>
        )}
      </div>

      {/* CreateNewDialog is now handled in layout.tsx */}
      </div>
    </div>
  );
}