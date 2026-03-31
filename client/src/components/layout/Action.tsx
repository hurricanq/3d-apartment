import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Action = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-0 bg-black text-white border-t border-neutral-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight text-center md:text-left">
            Plan your idea. Build your dream.
          </h2>
          <div className="flex gap-6 shrink-0">
            <Button variant="secondary" asChild className="w-full sm:w-auto">
              <Link href="/projects">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Action;
