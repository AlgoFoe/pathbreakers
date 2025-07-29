"use client";
import { GraduationCap } from "lucide-react";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={`flex flex-col min-h-screen bg-white border-l border-gray-300 shadow-lg`}>
  <header className="hidden lg:sticky lg:top-0 lg:z-30 lg:w-full lg:bg-lblue lg:bg-opacity-20 lg:backdrop-filter lg:backdrop-blur-lg lg:shadow-lg lg:block z-30">
    <div className="container mx-auto px-4 py-2">
      <div className="flex gap-2 items-center justify-between ">
        <div className="flex items-center gap-1">
          <div className="bg-lblue bg-opacity-50 rounded-lg p-2">
            <GraduationCap className="text-black w-8 h-8" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <h1 className="hidden lg:block text-2xl sm:text-3xl lg:text-3xl font-bold text-black ml-0 sm:ml-2 leading-6 sm:leading-6">
              Courses
            </h1>
          </div>
        </div>
      </div>
    </div>
  </header>
  <main className="flex-grow">{children}</main>
</div>
  );
};

export default Layout;
