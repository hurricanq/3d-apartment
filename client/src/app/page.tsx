import React from "react";

import Hero from "@/components/layout/Hero";
import Features from "@/components/layout/Features";

const HomePage = () => {
  return (
    <div>
      <main className="relative min-h-screen">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />
      </main>
    </div>
  );
};

export default HomePage;
