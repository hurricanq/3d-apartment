import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Centralized asset config
const GALLERY_IMAGES = [
  { id: 1, name: "chairs", alt: "3D render of chairs" },
  { id: 2, name: "tables", alt: "3D render of tables" },
  { id: 3, name: "bathroom", alt: "3D render of a bathroom" },
];

const Gallery = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-0 bg-black text-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-6">
        <div className="flex flex-col space-y-4 sm:space-y-6 flex-1 w-full items-center md:items-start text-center md:text-left">
          <h2 className="font-semibold text-3xl sm:text-4xl md:text-5xl">
            Why Aperoom?
          </h2>
          <p className="max-w-sm text-gray-300 text-sm sm:text-base">
            Our platform uses WebGPU-accelerated rendering to give you a
            real-time look at your home with lighting and textures so accurate,
            you will try to sit on the virtual couch.
          </p>
        </div>

        <Carousel className="w-full md:flex-1 md:max-w-sm text-black">
          <CarouselContent>
            {GALLERY_IMAGES.map((img) => (
              <CarouselItem key={img.id}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-4 sm:p-6 overflow-hidden">
                      <div className="relative w-full aspect-square">
                        <Image
                          src={`/renders/${img.name}.png`}
                          fill
                          alt={img.alt}
                          className="object-cover hover:scale-150 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 384px"
                          loading="lazy"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label="Previous image" />
          <CarouselNext aria-label="Next image" />
        </Carousel>
      </div>
    </section>
  );
};

export default Gallery;
