import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aperoom",
  description: "3D Room Visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <body className={inter.className}>
          <NextTopLoader />
          <Header />
          <main className="pt-2">
            <Providers>{children}</Providers>
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
