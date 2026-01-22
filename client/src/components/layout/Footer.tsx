import React from "react";
import Link from "next/link";

import { Aperture, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-gray-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8">
        <div className="text-lg font-semibold">
          <Link href="/" className="flex items-center gap-2">
            <Aperture />
            Aperoom
          </Link>
        </div>

        <p className="text-center font-medium text-balance">
          {`©${new Date().getFullYear()}`}{" "}
          <a href="#" className="hover:underline">
            Aperoom
          </a>
          . Made with heart for better web.
        </p>

        <div className="flex items-center gap-5 whitespace-nowrap">
          <Link
            href="/about"
            className="opacity-80 transition-opacity duration-300 hover:opacity-100"
          >
            About
          </Link>
          <Link
            href="#"
            className="opacity-80 transition-opacity duration-300 hover:opacity-100"
          >
            Features
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
