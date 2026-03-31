"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SyncButton from "@/components/buttons/SyncButton";
import { Aperture, Menu } from "lucide-react";

const Header = () => {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = user?.publicMetadata.role === "admin";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black border-b border-gray-700">
      <div className="flex items-center justify-between md:max-w-6xl mx-auto px-12 md:px-0 py-2 text-white">
        {/* Logo (left) */}
        <div className="text-lg font-semibold">
          <Link href="/" className="flex items-center gap-2">
            <Aperture className="w-5 h-5" aria-hidden="true" />
            Aperoom
          </Link>
        </div>

        {/* Navigation buttons (center) */}
        <nav className="hidden md:flex space-x-5 text-base">
          <Button variant="ghost" asChild>
            <Link href="/projects">Projects</Link>
          </Button>
          {isAdmin && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          )}
        </nav>

        {/* Auth buttons (right) */}
        <div className="hidden md:flex space-x-3 text-base">
          <SyncButton />
          <SignedOut>
            <SignInButton>
              <Button variant="ghost">Log In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="secondary">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" aria-label="Open navigation menu">
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black text-white w-64">
              <SheetHeader>
                <SheetTitle className="text-white">Navigation</SheetTitle>
                <SheetDescription>Access your pages here.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col">
                <Button variant="ghost" className="h-16" asChild>
                  <Link
                    href="/projects"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-xl"
                  >
                    Projects
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="h-16" asChild>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-xl"
                    >
                      Dashboard
                    </Link>
                  </Button>
                )}
              </nav>
              <SheetFooter>
                <SyncButton />
                <SignedOut>
                  <SignInButton>
                    <Button>Log In</Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button variant="secondary">Sign Up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
