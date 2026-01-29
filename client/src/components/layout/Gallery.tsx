"use client";

import React from "react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

const images = [
  {
    id: 1,
    name: "chairs",
  },
  {
    id: 2,
    name: "tables",
  },
  {
    id: 3,
    name: "bathroom",
  },
];

const Gallery = () => {
  return (
    <section className="py-16 px-6 lg:px-0 bg-black text-white">
      <div className="max-w-6xl mx-auto flex gap-6">
        <motion.div
          className="flex flex-col space-y-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 2.0, ease: "easeOut" }}
        >
          <h2 className="font-semibold text-5xl">Why Aperoom?</h2>
          <p className="w-1/2">
            Our platform uses WebGPU-accelerated rendering to give you a
            real-time look at your home with lighting and textures so accurate,
            you'll try to sit on the virtual couch.
          </p>
        </motion.div>

        <Carousel className="w-full max-w-[12rem] sm:max-w-xs text-black">
          <CarouselContent>
            {images.map((img) => (
              <CarouselItem key={img.id}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <Image
                        src={`/renders/${img.name}.png`}
                        width={300}
                        height={300}
                        alt="Model image"
                        className="aspect-square object-cover hover:scale-150 transition-transform"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default Gallery;
