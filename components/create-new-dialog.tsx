'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import MockInterviewDialog from './mock-interview-dialog';

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

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.66667 12.6667C2.66667 12.313 2.80714 11.9739 3.05719 11.7239C3.30724 11.4738 3.64638 11.3333 4 11.3333H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 1.33333H13.3333V14.6667H4C3.64638 14.6667 3.30724 14.5262 3.05719 14.2761C2.80714 14.0261 2.66667 13.687 2.66667 13.3333V2.66666C2.66667 2.31304 2.80714 1.9739 3.05719 1.72385C3.30724 1.47381 3.64638 1.33333 4 1.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNewDialog({ open, onOpenChange }: CreateNewDialogProps) {
  const [openMockInterviewForm, setOpenMockInterviewForm] = useState(false);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        
        <DialogTitle className="text-xl font-semibold">Create New</DialogTitle>
        <DialogDescription className=""></DialogDescription>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            {/* New Mock Interview */}
            <div className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 hover:bg-accent" onClick={() => {
              onOpenChange(false);
              setOpenMockInterviewForm(true);
            }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <HeadsetIcon />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">New Mock Interview</span>
                <span className="text-sm text-muted-foreground">Practice for your next interview</span>
              </div>
            </div>

            {/* New Resume */}
            <div className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ResumeIcon />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">New Resume</span>
                <span className="text-sm text-muted-foreground">Create a professional resume</span>
              </div>
            </div>

            {/* New CV */}
            <div className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BookIcon />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">New CV</span>
                <span className="text-sm text-muted-foreground">Create a detailed curriculum vitae</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <MockInterviewDialog open={openMockInterviewForm} onOpenChange={setOpenMockInterviewForm} />
    </>
  );
}