"use client";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavLinks } from "@/constants";
import {
  BookOpen,
  GraduationCap,
  House,
  Info,
  LayoutDashboard,
  LibraryBig,
  Mail,
  Newspaper,
  NotebookPen,
  Users,
  Zap
} from "lucide-react";

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
  "/Newspaper": <Newspaper />, 
  "/Users": <Users />
};

const Sidebar = () => {
  const pathname = usePathname();
  const { isSignedIn } = useUser(); 
  
  if (!isSignedIn || pathname==='/' ) {
    return null;
  }
  const NavLinks = dashboardNavLinks;

  return (
    <>
      {isSignedIn && (
        <aside className="sidebar-container">
          <div className="sidebar">
            <div className="flex size-full flex-col gap-4">
              <Link href="/" className="sidebar-logo  w-full h-auto my-2">
            <Image
              src="/assets/images/logo-red.png"
              alt="logo"
              width={200}
              height={20}
              className="translate-x-6 -m-2"
            />
          </Link>
              <nav className="sidebar-nav">
              <SignedIn>
            <ul className="sidebar-nav_elements h-auto">              {NavLinks.slice(0, NavLinks.length).map((link) => {
                let isActive =
                  link.route === pathname ||
                  (link.label === "Quiz" && pathname.startsWith("/dashboard/quiz")) ||
                  (link.label === "Blogs" && pathname.startsWith("/dashboard/blogs")) ||
                  (link.label === "Question Banks" && pathname.startsWith("/dashboard/question-banks"))
                  || (link.label === "Flash Cards" && pathname.startsWith("/dashboard/flashcards")) ;

                if (
                  (pathname === "/cuet-syllabus" || pathname === "/mentors") &&
                  link.label === "Home"
                ) {
                  isActive = true;
                }
                return (
                  <li
                    key={link.route}
                    className={`sidebar-nav_element group ${
                      isActive ? "bg-black text-white" : "text-gray-700"
                    }`}
                  >
                    <Link
                      className="sidebar-link"
                      href={link.route}
                    >
                      <span
                        className={`sidebar-icon ${
                          isActive && "brightness-200"
                        }`}
                      >
                        {iconMap[link.icon]}
                      </span> 
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ul className="sidebar-nav_elements">
              
              <li className="flex hover:bg-gray-200 rounded-lg cursor-pointer w-full p-2 mt-1 mb-1">
                <UserButton
                  afterSignOutUrl="/"
                  showName
                  appearance={{
                    elements: {
                      userButtonBox: {
                        whiteSpace: "nowrap",
                        width: "18em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "start",
                      },
                      userButtonAvatarBox: {
                        width: "1.4rem",
                        height: "1.4rem",
                      },
                      userButtonOuterIdentifier: {
                        marginLeft: "-9px",
                      },
                    },
                  }}
                />
              </li>
            </ul>
          </SignedIn>
              </nav>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;