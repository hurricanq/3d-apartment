import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

import AdminDashboard from "@/components/dashboard/AdminDashboard"

export default function AdminPage() {
    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                <div>
                    <div className="max-w-7xl mx-auto">
                        <AdminDashboard />
                    </div>
                </div>
            </SignedIn>
        </>
    );
}