"use client";

import React from "react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { House, Palette, Save } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <House />,
      title: "3D Visualization",
      description:
        "Experience your apartment in immersive 3D before you build.",
    },
    {
      icon: <Palette />,
      title: "Custom Design",
      description: "Personalize every detail with easy-to-use tools.",
    },
    {
      icon: <Save />,
      title: "Save Designs",
      description: "Store and revisit your creations anytime.",
    },
  ];

  return (
    <section className="py-16 px-6 lg:px-0 bg-black text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-end gap-6">
          <motion.h2
            className="w-1/2 font-semibold text-5xl leading-tight"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 2.0, ease: "easeOut" }}
          >
            Made for homeowners and students
          </motion.h2>
          <motion.p
            className="w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 2.0, ease: "easeOut" }}
          >
            Aperoom is a cutting-edge web application designed to turn your
            vague "I think this fits here" ideas into stunning, photorealistic
            3D realities.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700 transition-colors"
            >
              <CardHeader>
                <div className="flex justify-center mb-3">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
