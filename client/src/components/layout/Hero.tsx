import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Hero background */}
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        className="object-cover opacity-20"
        sizes="100vw"
      />

      {/* Content Overlay */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl w-full">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold text-white mb-3 sm:mb-4 leading-tight">
          Visualize your 3D rooms
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8">
          Design and explore immersive 3D spaces with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <Link href="/projects">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
