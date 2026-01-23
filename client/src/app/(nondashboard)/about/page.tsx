import React from "react";

import Hero from "./Hero";
import Features from "./Features";

const AboutUsPage = () => {
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

export default AboutUsPage;
