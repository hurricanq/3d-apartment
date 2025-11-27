"use client";

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

import { NAVBAR_HEIGHT } from "@/lib/constants"
import SyncButton from './SyncButton';

export default function Navbar() {
  const { user } = useUser();

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-white shadow-md"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-0 py-3">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link href="/">Apartmelizer</Link>
        </div>

        {/* Center Nav Buttons */}
        <div className="flex space-x-3">
          {user?.publicMetadata.role == "admin" && (
            <Button>
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          )}
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost">About Us</Button>
          </Link>
        </div>

        {/* Right Auth Buttons */}
        <div className="flex space-x-3">
          <SyncButton />
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}