import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { House, Palette, Save } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <House className="w-7 h-7" />,
      title: "3D Visualization",
      description:
        "Experience your apartment in immersive 3D before you build.",
    },
    {
      icon: <Palette className="w-7 h-7" />,
      title: "Custom Design",
      description: "Personalize every detail with easy-to-use tools.",
    },
    {
      icon: <Save className="w-7 h-7" />,
      title: "Save Designs",
      description: "Store and revisit your creations anytime.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-0 bg-black text-white">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 items-center text-center md:text-left">
          <h2 className="w-full md:w-1/2 font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
            Made for homeowners and students
          </h2>
          <p className="w-full md:w-1/2 text-gray-300 text-sm sm:text-base">
            Aperoom is a cutting-edge web application designed to turn your
            vague &quot;I think this fits here&quot; ideas into stunning,
            photorealistic 3D realities.
          </p>
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
