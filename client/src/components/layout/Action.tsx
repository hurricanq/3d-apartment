import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const Action = () => {
  return (
    <section className="py-16 px-6 lg:px-0 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-5xl">
            Plan your idea. Build your dream.
          </h2>
          <div className="flex gap-6">
            <Link href="/projects">
              <Button variant="secondary">Get Started</Button>
            </Link>
            <Link href="/about">
              <Button>Learn More</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Action;
