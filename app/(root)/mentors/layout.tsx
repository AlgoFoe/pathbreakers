"use client";

import { Roboto, Poppins } from "next/font/google";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function MentorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay of 500ms
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={`${poppins.className} min-h-screen bg-white border-l border-gray-300 shadow-lg`}>
      <header className="hidden lg:sticky lg:top-0 lg:z-10 lg:w-full lg:bg-lblue lg:bg-opacity-20 lg:backdrop-filter lg:backdrop-blur-lg lg:shadow-lg lg:block">
        <div className="container mx-auto px-4 py-2">
          <div className="flex gap-2 items-center justify-between ">
        <div className="flex items-center gap-1">
          <div className="bg-lblue bg-opacity-50 rounded-lg p-2">
            <span className={`sidebar-icon`}>
                <Users className="text-black w-8 h-8" aria-hidden="true" />
            </span>
          </div>
         <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-black ml-0 sm:ml-2 leading-6 sm:leading-6">
            Mentorship
            </h1>
          </div>
        </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="p-6">
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            
            <div className="flex justify-center space-x-4 my-8">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </main>
  );
}
