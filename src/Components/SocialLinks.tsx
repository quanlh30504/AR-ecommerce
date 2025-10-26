"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Globe, Github, Linkedin } from "lucide-react";
import { Button } from "@/Components/ui/button";

const SocialLinks: React.FC = () => {
  const links = useMemo(() => [
    { icon: <Facebook className="w-4 h-4" />, label: "FACEBOOK", href: "#" },
    { icon: <Twitter className="w-4 h-4" />, label: "TWITTER", href: "#" },
    { icon: <Instagram className="w-4 h-4" />, label: "INSTAGRAM", href: "#" },
    { icon: <Globe className="w-4 h-4" />, label: "GOOGLE +", href: "#" },
    { icon: <Github className="w-4 h-4" />, label: "GITHUB", href: "#" },
    { icon: <Linkedin className="w-4 h-4" />, label: "LINKEDIN", href: "#" },
  ], []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/50 p-6 border border-gray-100 dark:border-gray-700 mb-8">
      <div className="flex flex-wrap justify-center items-center text-gray-400 dark:text-gray-500 text-sm">
        {links.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:text-[#8BC34A] dark:hover:text-[#9CCC65] transition-colors"
            >
              <Link href={item.href} className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center border border-gray-400 dark:border-gray-600 rounded-full hover:border-[#8BC34A] dark:hover:border-[#9CCC65] hover:bg-[#8BC34A]/10 dark:hover:bg-[#9CCC65]/10 transition-all duration-300">
                  {item.icon}
                </span>
                <span className="font-semibold">{item.label}</span>
              </Link>
            </Button>

            {index !== links.length - 1 && (
              <span className="mx-3 text-gray-300 dark:text-gray-600 select-none">/</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SocialLinks);
