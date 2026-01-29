"use client";

import React from "react";
import { motion } from "framer-motion";

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
      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 2.0, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4">
          About us
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8">
          Design and explore immersive 3D spaces with ease.
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;
