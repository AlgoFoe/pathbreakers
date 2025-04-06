
"use client";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/constants";
import {
  Bed,
  BriefcaseMedical,
  CalendarPlus2,
  House,
  HousePlus,
  MessageSquareMore,
  MessageSquarePlus,
  Newspaper,
  Pill,
  PlusIcon,
  Star,
  Stethoscope,
  UserRound
} from "lucide-react";

const iconMap = {
  "/FaHome": <House />,
  "/FaStar": <Star />,
  "/FaBriefcaseMedical": <BriefcaseMedical />,
  "/FaUser": <UserRound />,
  "/FaStethoscope": <Stethoscope />,
  "/FaChat": <MessageSquareMore />,
  "/FaHousePlus": <HousePlus />,
  "/FaCalendarPlus2": <CalendarPlus2 />,
  "/FaPlus": <PlusIcon />,
  "/FaPill": <Pill />,
  "/FaNewspaper": <Newspaper />,
  "/FaMessage": <MessageSquarePlus />,
  "/FaBed": <Bed />,
};

const Sidebar = () => {
  const pathname = usePathname();
  const baseRoute = "/" + pathname.split("/").slice(1, 4).join("/");
  const { isSignedIn } = useUser();
  
  if ( isSignedIn) {
    return null;
  }
  const NavLinks = navLinks;

  return (
    <>
      {isSignedIn && (
        <aside className="sidebar-container">
          <div className="sidebar">
            <div className="flex size-full flex-col gap-4">
              <Link href="/" className="sidebar-logo  w-full h-auto  my-2">
            <Image
              src="/assets/images/logov.png"
              alt="logo"
              width={320}
             height={20}
              className="m-0 bg-black"
            />
          </Link>
              <nav className="sidebar-nav">
              <SignedIn>
            <ul className="sidebar-nav_elements h-auto">
              {NavLinks.slice(0, NavLinks.length - 1).map((link) => {
                const isActive = link.route == baseRoute;
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
              {NavLinks.slice(NavLinks.length - 1).map((link) => {
                const isActive = link.route == pathname;
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