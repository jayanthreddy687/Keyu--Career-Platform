'use client';

import { useState, useEffect } from 'react';
import Logo from "@/app/assets/icons/logo.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CreateNewDialog } from "@/components/create-new-dialog";
import { usePathname, useRouter } from 'next/navigation';
import SignOutDialog from '@/components/sign-out-dialog';
import ErrorBoundary from '@/components/error-boundary';
import { useUser } from '@clerk/nextjs';

// SVG Icons
const HouseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 6.00001L8.70711 0.707108C8.31658 0.316584 7.68342 0.316584 7.29289 0.707108L2 6.00001M4 4.00001V2.00001H6V4.00001M3 15H13C13.5523 15 14 14.5523 14 14V5.00001C14 4.73479 13.8946 4.48044 13.7071 4.2929L8 10L2.29289 4.2929C2.10536 4.48044 2 4.73479 2 5.00001V14C2 14.5523 2.44772 15 3 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5.33334V10.6667M5.33333 8.00001H10.6667M14.6667 8.00001C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8.00001C1.33333 4.31811 4.3181 1.33334 8 1.33334C11.6819 1.33334 14.6667 4.31811 14.6667 8.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeadsetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.33333 8.66667V8C1.33333 4.31811 4.3181 1.33334 8 1.33334C11.6819 1.33334 14.6667 4.31811 14.6667 8V8.66667M1.33333 8.66667C1.33333 8.66667 1.33333 12.6667 3.33333 12.6667C5.33333 12.6667 5.33333 8.66667 5.33333 8.66667M1.33333 8.66667H2M14.6667 8.66667C14.6667 8.66667 14.6667 12.6667 12.6667 12.6667C10.6667 12.6667 10.6667 8.66667 10.6667 8.66667M14.6667 8.66667H14M5.33333 8.66667H10.6667M6 12.6667V14C6 14.3682 6.29848 14.6667 6.66667 14.6667H9.33333C9.70152 14.6667 10 14.3682 10 14V12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ResumeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6.66667H12M4 9.33334H12M4 12H8M9.33333 1.33334H3.33333C2.59695 1.33334 2 1.93029 2 2.66667V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V6.00001L9.33333 1.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 11.3333H3.33333C2.59695 11.3333 2 10.7364 2 10V3.33334C2 2.59696 2.59695 2.00001 3.33333 2.00001H12.6667C13.403 2.00001 14 2.59696 14 3.33334V10C14 10.7364 13.403 11.3333 12.6667 11.3333H11.3333M8 11.3333L6.66667 14H9.33333L8 11.3333ZM4.66667 5.33334H11.3333M4.66667 8.00001H11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 5.33334C10 6.43791 9.10457 7.33334 8 7.33334C6.89543 7.33334 6 6.43791 6 5.33334C6 4.22877 6.89543 3.33334 8 3.33334C9.10457 3.33334 10 4.22877 10 5.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00001C14.6667 4.31811 11.6819 1.33334 8 1.33334C4.3181 1.33334 1.33333 4.31811 1.33333 8.00001C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.3999 12.4C4.3999 12.4 5.33323 10.6667 7.99989 10.6667C10.6666 10.6667 11.5999 12.4 11.5999 12.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GiftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5.33334V14.6667M8 5.33334H5.33333C4.22876 5.33334 3.33333 4.43791 3.33333 3.33334C3.33333 2.22877 4.22876 1.33334 5.33333 1.33334C7.33333 1.33334 8 5.33334 8 5.33334ZM8 5.33334H10.6667C11.7712 5.33334 12.6667 4.43791 12.6667 3.33334C12.6667 2.22877 11.7712 1.33334 10.6667 1.33334C8.66667 1.33334 8 5.33334 8 5.33334ZM2 5.33334H14V9.33334C14 10.0697 13.403 10.6667 12.6667 10.6667H3.33333C2.59695 10.6667 2 10.0697 2 9.33334V5.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Sidebar navigation item component
const NavItem = ({
  icon,
  label,
  active = false,
  badge,
  onClick
}: {
  icon: React.ReactNode,
  label: string,
  active?: boolean,
  badge?: string,
  onClick?: () => void
}) => {
  return (
    <div
      className={cn(
        "flex items-center py-1.5 px-2 rounded-md gap-2 cursor-pointer transition-all",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.98]"
      )}
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className={cn(
        "flex items-center justify-center w-6 h-6 rounded-[3.6px] transition-colors",
        active ? "text-sidebar-primary-foreground" : "text-foreground"
      )}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <div className="ml-auto px-2 py-0.5 text-xs font-medium rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
          {badge}
        </div>
      )}
    </div>
  );
};

// Sidebar category label
const CategoryLabel = ({ label }: { label: string }) => {
  return (
    <div className="text-xs font-medium text-muted-foreground py-1">
      {label}
    </div>
  );
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  // Listen for custom event to open the dialog from any component
  useEffect(() => {
    const handleOpenDialog = () => setShowNewMenu(true);
    window.addEventListener('open-create-new-dialog', handleOpenDialog);
    return () => window.removeEventListener('open-create-new-dialog', handleOpenDialog);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on tablet and desktop */}
      <div className="hidden md:flex md:w-64 h-full bg-sidebar flex-col">
        <div className="px-3 pt-3 pb-1.5 flex items-center gap-2">
          <div className="flex items-center justify-center rounded-md shadow-sm">
            <svg width="35" height="35" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g filter="url(#filter0_di_77_1787)">
                <rect x="0.906006" y="0.453018" width="20" height="20" rx="3.62416" fill="#3E1C00" />
                <path d="M17.2817 10.7213C17.2817 11.5234 17.1168 12.3175 16.7964 13.0585C16.476 13.7995 16.0063 14.4728 15.4143 15.0399C14.8222 15.607 14.1193 16.0569 13.3458 16.3638C12.5722 16.6707 11.7432 16.8287 10.9059 16.8287C10.0686 16.8287 9.23949 16.6707 8.46594 16.3638C7.69239 16.0569 6.98952 15.607 6.39747 15.0399C5.80542 14.4728 5.33578 13.7995 5.01536 13.0585C4.69495 12.3175 4.53003 11.5234 4.53003 10.7213L7.09949 10.7213C7.09949 11.2002 7.19795 11.6743 7.38924 12.1166C7.58052 12.559 7.8609 12.961 8.21435 13.2995C8.56781 13.6381 8.98742 13.9067 9.44923 14.0899C9.91104 14.2731 10.406 14.3674 10.9059 14.3674C11.4057 14.3674 11.9007 14.2731 12.3625 14.0899C12.8243 13.9067 13.2439 13.6381 13.5974 13.2995C13.9508 12.961 14.2312 12.559 14.4225 12.1166C14.6138 11.6743 14.7122 11.2002 14.7122 10.7213H17.2817Z" fill="white" />
                <path d="M17.2817 4.07704V8.90926H14.7127V6.53789H11.3496V4.07704H17.2817Z" fill="white" />
                <path d="M7.3326 7.45512C7.3326 8.19644 6.70522 8.7974 5.93131 8.7974C5.15741 8.7974 4.53003 8.19644 4.53003 7.45512C4.53003 6.7138 5.15741 6.11284 5.93131 6.11284C6.70522 6.11284 7.3326 6.7138 7.3326 7.45512Z" fill="white" />
              </g>
              <defs>
                <filter id="filter0_di_77_1787" x="-3.43919e-05" y="-1.93715e-06" width="21.8121" height="21.8121" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                  <feOffset dy="0.45302" />
                  <feGaussianBlur stdDeviation="0.45302" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_77_1787" />
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_77_1787" result="shape" />
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                  <feOffset dy="-1.35906" />
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                  <feBlend mode="normal" in2="shape" result="effect2_innerShadow_77_1787" />
                </filter>
              </defs>
            </svg>
          </div>
          <span className="text-base font-semibold">Keyu</span>
        </div>

        <div className="flex-1 px-3 py-1 flex flex-col gap-0.5 overflow-y-auto">
          <CategoryLabel label="action" />
          <NavItem
            icon={<HouseIcon />}
            label="Workspace"
            active={pathname === "/home"}
            onClick={() => {
              if (pathname !== "/home") router.push("/home");
            }}
          />
          <NavItem
            icon={<PlusCircleIcon />}
            label="New"
            onClick={() => {
              setShowNewMenu(true);
            }}
          />

          <CategoryLabel label="Products" />
          <NavItem
            icon={<HeadsetIcon />}
            label="Practice Interview"
            active={pathname === "/home/practice-interview"}
            onClick={() => {
              if (pathname !== "/home/practice-interview") router.push("/home/practice-interview");
            }}
          />
          <NavItem
            icon={<ResumeIcon />}
            label="Make Resume"
            badge="beta"
            active={pathname === "/home/make-resume"}
            onClick={() => {
              if (pathname !== "/home/make-resume") router.push("/home/make-resume");
            }}
          />
          <NavItem
            icon={<BookIcon />}
            label="Make Cover Letter"
            badge="beta"
            active={pathname === "/home/make-cover-letter"}
            onClick={() => {
              if (pathname !== "/home/make-cover-letter") router.push("/home/make-cover-letter");
            }}
          />

          <CategoryLabel label="Personal settings" />
          <NavItem
            icon={<UserCircleIcon />}
            label="Account"
            badge="Free Plan"
            active={pathname === "/home/account"}
            onClick={() => {
              if (pathname !== "/home/account") router.push("/home/account");
            }}
          />
          <NavItem
            icon={<GiftIcon />}
            label="Invite Friends"
            active={pathname === "/home/invite-friends"}
            onClick={() => {
              if (pathname !== "/home/invite-friends") router.push("/home/invite-friends");
            }}
          />
        </div>

        <div className='px-3 py-2'>
          {isLoaded && isSignedIn && user && <p>{user.fullName}</p>}
          <SignOutDialog />
        </div>
      </div>

      {/* Mobile Header with Sheet for sidebar */}
      <div className="md:hidden px-4 pt-4 pb-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-md shadow-sm">
            <Logo className="w-auto h-auto" />
          </div>
          <span className="text-lg font-semibold">Jobly</span>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-sidebar">
            <SheetTitle></SheetTitle>
            <div className="px-3 py-1.5 flex items-center gap-2 border-b border-sidebar-border">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary shadow-sm">
                <Logo className="w-5 h-5" />
              </div>
              <span className="text-base font-semibold">Jobly</span>
            </div>

            <div className="flex-1 px-3 py-1 flex flex-col gap-0.5 overflow-y-auto">
              <CategoryLabel label="action" />
              <NavItem
                icon={<HouseIcon />}
                label="Home"
                active={pathname === "/home"}
                onClick={() => {
                  if (pathname !== "/home") router.push("/home");
                }}
              />
              <NavItem
                icon={<PlusCircleIcon />}
                label="New"
                onClick={() => {
                  setShowNewMenu(true);
                }}
              />

              <CategoryLabel label="Products" />
              <NavItem
                icon={<HeadsetIcon />}
                label="Practice Interview"
                active={pathname === "/home/practice-interview"}
                onClick={() => {
                  if (pathname !== "/home/practice-interview") router.push("/home/practice-interview");
                }}
              />
              <NavItem
                icon={<ResumeIcon />}
                label="Make Resume"
                badge="beta"
                active={pathname === "/home/make-resume"}
                onClick={() => {
                  if (pathname !== "/home/make-resume") router.push("/home/make-resume");
                }}
              />
              <NavItem
                icon={<BookIcon />}
                label="Make Cover Letter"
                badge="beta"
                active={pathname === "/home/make-cover-letter"}
                onClick={() => {
                  if (pathname !== "/home/make-cover-letter") router.push("/home/make-cover-letter");
                }}
              />

              <CategoryLabel label="Personal settings" />
              <NavItem
                icon={<UserCircleIcon />}
                label="Account"
                badge="Free Plan"
                active={pathname === "/home/account"}
                onClick={() => {
                  if (pathname !== "/home/account") router.push("/home/account");
                }}
              />
              <NavItem
                icon={<GiftIcon />}
                label="Invite Friends"
                active={pathname === "/home/invite-friends"}
                onClick={() => {
                  if (pathname !== "/home/invite-friends") router.push("/home/invite-friends");
                }}
              />
            </div>

            <div className='px-3 py-2'>
              {isLoaded && isSignedIn && user && <p>{user.fullName}</p>}
              <SignOutDialog />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>

      {/* Create New Dialog - shared between layout and page */}
      <CreateNewDialog open={showNewMenu} onOpenChange={setShowNewMenu} />
    </div>
  );
}