import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

import UserDashboard from "@/components/dashboard/UserDashboard"

export default function DashboardPage() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div>
          <div className="max-w-7xl mx-auto">
            <UserDashboard />
          </div>
        </div>
      </SignedIn>
    </>
  );
}