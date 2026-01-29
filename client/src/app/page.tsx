import React from "react";

import Hero from "@/components/layout/Hero";
import Features from "@/components/layout/Features";
import Gallery from "@/components/layout/Gallery";
import Action from "@/components/layout/Action";

const HomePage = () => {
  return (
    <div>
      <main className="relative min-h-screen">
        <Hero />
        <Features />
        <Gallery />
        <Action />
      </main>
    </div>
  );
};

export default HomePage;
