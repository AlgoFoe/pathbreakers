"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { dashboardNavLinks, homeNavLinks } from "@/constants";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  HomeIcon as House,
  Info,
  LayoutDashboard,
  LibraryBig,
  Mail,
  Menu,
  Newspaper,
  NotebookPen,
  Users,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const iconMap = {
  "/FaHome": <House />,
  "/LayoutDashboard": <LayoutDashboard />,
  "/LibraryBig": <LibraryBig />,
  "/NotebookPen": <NotebookPen />,
  "/GraduationCap": <GraduationCap />,
  "/Zap": <Zap />,
  "/Info": <Info />,
  "/BookOpen": <BookOpen />,
  "/Mail": <Mail />,
  "/Newspaper": <Newspaper/>, 
  "/Users": <Users />
};

const MobileNav = () => {
  const pathname = usePathname();
  let baseRoute = pathname.split("/").slice(1, 2).join("/");
  if (baseRoute === "") {
    baseRoute = "Home";
  }
  
  const NavLinks = baseRoute === "dashboard" ? dashboardNavLinks : homeNavLinks;
  let title = "";
  
  const dashBoardFeature = pathname.split("/")[2];
  const homeFeature = pathname.split("/")[1];
  if (dashBoardFeature === "study-materials") {
    title = "Study Materials";
  } else if (dashBoardFeature === "quiz") {
    title = "Quiz Dashboard";
  } else if (dashBoardFeature === "flashcards") {
    title = "Flash Cards";
  } else if (dashBoardFeature === "blogs") {
    title = "Blogs";
  } else if (homeFeature === "mentors" || homeFeature === "cuet-syllabus") {
    title = "Home";
  } else {
    title = "Dashboard";
  }
  const [isSheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="header flex items-center z-30">
      <Link href="/" className="flex">
        <Image
          src="/assets/images/large-logored.png"
          alt="logo"
          width={120}
          height={100}
          className="-translate-x-6"
        />
      </Link>
      <div className="text-3xl sm:text-3xl lg:text-4xl font-bold text-black ml-0 sm:ml-2 leading-5 sm:leading-6 -translate-x-6 whitespace-nowrap">
        {title}
      </div>
      <nav className="flex items-center gap-2">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
          <Sheet open={isSheetOpen} onOpenChange={() => setSheetOpen(!isSheetOpen)}>
            <SheetTrigger asChild>
              <Button title="Menu" className="p-0">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="sheet-content bg-white sm:w-64 p-4 flex flex-col justify-between [&>button]:text-black [&>button]:ring-2"
            >
              <div>
                <DialogTitle></DialogTitle>
                <div className="flex flex-col gap-4">
                  <Image
                    src="/assets/images/logo-red.png"
                    alt="logo"
                    width={152}
                    height={23}
                    className="translate-x-1/3"
                  />                  <ul className="flex flex-col gap-2 overflow-auto">
                    {NavLinks.map((link) => {
                     const isActive =
                  link.route === pathname ||
                  (link.label === "Quiz" && pathname.startsWith("/dashboard/quiz"));
                      
                      if (link.label === "CUET Syllabus") {
                        return (
                          <li
                            key={link.route}
                            className={`bg-gray-100 ${
                              pathname.startsWith("/cuet-syllabus") && "bg-gray-700"
                            }  bg-gray-200 transition-colors duration-200 text-black rounded-lg p-1`}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full">
                                <div 
                                  className={`flex items-center justify-between w-full gap-2 p-2 text-lg font-bold hover:text-gray-700 ${
                                    pathname.startsWith("/cuet-syllabus") ? "text-white" : "text-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{iconMap[link.icon]}</span>
                                    <span>{link.label}</span>
                                  </div>
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-full">
                                <DropdownMenuItem 
                                  className="text-gray-400 cursor-not-allowed"
                                  disabled
                                >
                                  Science
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSheetOpen(false);
                                    window.location.href = "/cuet-syllabus/commerce";
                                  }}
                                >
                                  Commerce
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-gray-400 cursor-not-allowed"
                                  disabled
                                >
                                  Arts
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </li>
                        );
                      }
                      
                      return (
                        <li
                          key={link.route}
                          className={`bg-gray-100 ${
                            isActive && "bg-gray-700"
                          }  bg-gray-200 transition-colors duration-200 text-black rounded-lg p-1`}
                        >
                          <Link
                            href={link.route}
                            className={`flex items-center gap-2 p-2 text-lg font-bold hover:text-gray-700 ${
                              isActive ? "text-white" : "text-gray-700"
                            }`}
                            onClick={() => setSheetOpen(!isSheetOpen)}
                          >
                            <span>{iconMap[link.icon]}</span>
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </SignedIn>

        <SignedOut>
          <Button asChild className="bg-black">
            <Link href="/sign-in">Login</Link>
          </Button>
        </SignedOut>
      </nav>
    </header>
  );
};

export default MobileNav;
