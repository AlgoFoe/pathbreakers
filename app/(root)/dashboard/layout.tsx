"use client";
import { LayoutDashboard, LibraryBig, Newspaper, NotebookPen, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
interface LayoutProps {
  children: React.ReactNode;
}

const iconMap = {
  "Dashboard": <LayoutDashboard />,
  "Study Materials": <LibraryBig />,
  "Quiz Dashboard": <NotebookPen />,
  "Flash Cards": <Zap />,
  "Blogs": <Newspaper/>, 
} as const;

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  let title = "";
  if (pathname === "/") {
    return null;
  }
  const dashBoardFeature = pathname.split("/")[2];
  if (dashBoardFeature === "study-materials") {
    title = "Study Materials";
  } else if (dashBoardFeature === "quiz") {
    title = "Quiz Dashboard";
  } else if (dashBoardFeature === "flashcards") {
    title = "Flash Cards";
  } else if (dashBoardFeature === "blogs") {
    title = "Blogs";
  } else {
    title = "Dashboard";
  }
  return (
    <div
      className={`flex flex-col min-h-screen bg-white border-l border-gray-300 shadow-lg`}
    >
      <header className="hidden lg:sticky lg:top-0 lg:z-10 lg:w-full lg:bg-lblue lg:bg-opacity-20 lg:backdrop-filter lg:backdrop-blur-lg lg:shadow-lg lg:block">
        <div className="container mx-auto px-4 py-2">
          <div className="flex gap-2 items-center justify-between ">
        <div className="flex items-center gap-1">
          <div className="bg-lblue bg-opacity-50 rounded-lg p-2">
            <span className={`sidebar-icon`}>
          {iconMap[title as keyof typeof iconMap]}
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-black ml-0 sm:ml-2 leading-6 sm:leading-6">
          {title}
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
