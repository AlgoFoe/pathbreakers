"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navLinks } from "@/constants";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Bed,
  BriefcaseMedical,
  CalendarPlus2,
  House,
  HousePlus,
  Menu,
  MessageSquareMore,
  MessageSquarePlus,
  Newspaper,
  Pill,
  PlusIcon,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
const iconMap = {
  "/FaHome": <House />,
  "/FaStar": <Star />,
  "/FaBriefcaseMedical": <BriefcaseMedical />,
  "/FaUser": <UserRound />,
  "/FaStethoscope": <Stethoscope />,
  "/FaChat": <MessageSquareMore />,
  "/FaCalendarPlus2": <CalendarPlus2/>,
  "/FaHousePlus": <HousePlus/>,
  "/FaPlus":<PlusIcon/>,
  "/FaPill":<Pill/>,
  "/FaNewspaper":<Newspaper/>,
    "/FaMessage": <MessageSquarePlus />,
    "/FaBed": <Bed />,
};

const MobileNav = () => {
  const pathname = usePathname();
  const baseRoute = "/" + pathname.split("/").slice(1, 4).join("/");
  const NavLinks = navLinks
  const [isSheetOpen, setSheetOpen] = useState(false);
  
  return (
    <header className="header flex items-center z-10 ">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/assets/images/logo-large2.png"
          alt="logo"
          width={60}
          height={51}
        />
      </Link>
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue ml-0 sm:ml-2 leading-5 sm:leading-6">
        {baseRoute}
      </div>
      <nav className="flex items-center gap-2 ">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
          <Sheet  open={isSheetOpen} onOpenChange={()=>setSheetOpen(!isSheetOpen)}>
            <SheetTrigger asChild>
              <Button title="Menu" className="p-0">
              <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sheet-content sm:w-64 p-4 flex flex-col justify-between">
              <div>
                <DialogTitle></DialogTitle>
                <div className="flex flex-col gap-4">
                  <Image
                    src="/assets/images/logov.png"
                    alt="logo"
                    width={152}
                    height={23}
                  />
                  <ul className="flex flex-col gap-2 overflow-auto ">
                    {NavLinks
                      .filter(link => link.label !== "Profile")
                      .map((link) => {
                        const isActive = link.route === baseRoute;
                        return (
                          <li key={link.route} className={`bg-gray-100 ${isActive && 'bg-gray-300'} rounded-lg p-1`}>
                            <Link
                              href={link.route}
                              className={`flex items-center gap-2 p-2 text-lg font-bold ${
                                isActive ? "text-black" : "text-gray-700"
                              }`}
                              onClick={()=>setSheetOpen(!isSheetOpen)}
                            >
                              <span>
                                {iconMap[link.icon]}
                              </span>
                              <span>{link.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
              <div className="bg-gray-400 rounded-lg p-1 mt-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 text-lg font-bold text-dark-700"
                >
                  <span>{iconMap["/FaUser"]}</span>
                  <span>Profile</span>
                </Link>
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
