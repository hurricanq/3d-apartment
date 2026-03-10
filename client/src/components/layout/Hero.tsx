import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Noise Texture Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("/hero.jpg")`,
          backgroundSize: "cover",
        }}
      ></div>

      {/* Content Overlay */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4">
          Visualize your 3D rooms
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8">
          Design and explore immersive 3D spaces with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/projects">
            <Button variant="secondary">Get Started</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
