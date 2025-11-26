"use client";

import React from 'react'
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { House, Palette, Save } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <House />,
      title: '3D Visualization',
      description: 'Experience your apartment in immersive 3D before you build.',
    },
    {
      icon: <Palette />,
      title: 'Custom Design',
      description: 'Personalize every detail with easy-to-use tools.',
    },
    {
      icon: <Save />,
      title: 'Save Designs',
      description: 'Store and revisit your creations anytime.',
    },
  ];
  
  return (
    <div>
      <main className="relative min-h-screen">
        {/* Hero Section */}
        <section className="aspect-video lg:aspect-[4/1]">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 aspect-video lg:aspect-[4/1] object-cover"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Content (with overlay) */}
          <div className="absolute inset-0 bg-black/50 aspect-video lg:aspect-[4/1]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-[33%] w-full text-center"  
            >
              <div className="max-w-5xl mx-auto px-16">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                  Bring your ideas to life.
                </h1>

                <p className="text-xl text-white mb-5">Design your own 3D apartment room. Simple.</p>
                <Link href="/dashboard">
                  <Button variant="secondary">Go to Dashboard</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-6 lg:px-0">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Why Choose Apartmelizer?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
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
      </main>
    </div>
  )
}

export default HomePage