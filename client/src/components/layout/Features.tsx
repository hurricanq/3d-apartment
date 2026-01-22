import React from "react";

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
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-10">
          Why Choose Aperoom?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center bg-gray-900 text-white border-gray-900"
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
