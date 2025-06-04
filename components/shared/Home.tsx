"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sec1 from "../ui/sec";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  BookOpen,
  FileQuestion,
  ScrollText,
  Clock,
  Calendar,
  ChevronRight,
  User,
  ArrowRight,
} from "lucide-react";

const boxVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Home = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [showLoginButton, setShowLoginButton] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoginButton(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="flex flex-col items-center justify-start gap-10 w-full bg-white">
      <header className="hidden lg:block sticky top-0 z-10 w-full bg-white/10 shadow-md">
        <nav className="navbar bg-white/10 ring-1 ring-black/5 backdrop-blur-md p-4">
          <div className="container-fluid flex flex-wrap justify-between items-center">
            <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
              <Image
                src="/assets/images/large-logo2red.png"
                alt="Logo"
                width={60}
                height={60}
              />
              <div className="text-3xl md:text-4xl font-bold text-red-700 font-serif">
                PathBreakers
              </div>
            </div>
            <div className="flex gap-10 self-center justify-self-start">
              <Link
                href="/dashboard"
                className="text-lg font-medium text-black hover:underline"
              >
                Dashboard
              </Link>
              <Link
                href="#about"
                className="text-lg font-medium text-black hover:underline"
              >
                About Us
              </Link>              <Link
                href="#courses"
                className="text-lg font-medium text-black hover:underline"
              >
                Courses
              </Link>
              <Link
                href="/mentors"
                className="text-lg font-medium text-black hover:underline"
              >
                Mentorship
              </Link>
              <DropdownMenu onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="link"
                    style={{
                      outline: "none !important",
                      boxShadow: "none !important",
                    }}
                    className="text-black font-semibold text-lg -translate-y-1.5"
                  >
                    CUET Syllabus
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="bg-white text-black shadow-lg rounded-md"
                >
                  <motion.div
                    initial="hidden"
                    animate={isDropdownOpen ? "visible" : "hidden"}
                    variants={dropdownVariants}
                  >
                    <DropdownMenuItem>
                      <Button
                        variant={"ghost"}
                        className="p-0 h-6 w-full text-base"
                        disabled
                        onClick={() => router.push("/cuet-syllabus/commerce")}
                      >
                        Science
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Button
                        variant="ghost"
                        className="p-0 h-6 w-full text-base"
                        onClick={() => router.push("/cuet-syllabus/commerce")}
                      >
                        Commerce
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Button
                        variant="ghost"
                        className="p-0 h-6 w-full text-base"
                        disabled
                        onClick={() => router.push("/cuet-syllabus/arts")}
                      >
                        Arts
                      </Button>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="#contact"
                className="text-lg font-medium text-black hover:underline"
              >
                Contact Us
              </Link>
            </div>
            <div>
              {showLoginButton &&
                (isSignedIn ? (
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: {
                          width: "2.4rem",
                          height: "2.4rem",
                        },
                      },
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="bg-black/90 shadow-lg hover:bg-gray-900 text-white font-semibold rounded-lg text-xl px-6 py-2"
                    onClick={() => router.push("/sign-in")}
                  >
                    Login
                  </button>
                ))}
            </div>
          </div>
        </nav>
      </header>{" "}
      <div className="w-full h-auto self-center">
        <Sec1 />
      </div>{" "}
      <div
        className="w-full flex flex-col items-center justify-start gap-4 px-10 md:px-32 pt-10 pb-20 relative bg-gray-50"
        id="services"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl text-black font-bold text-center tracking-wide my-10 relative"
        >
          <span className="relative">Our Dashboard Features</span>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {" "}
          <motion.div
            className="flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-300"
            variants={boxVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 80 }}
          >
            <div className="bg-white p-4">
              <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center">
                <FileQuestion className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="p-5 bg-gray-200 flex-grow">
              <h3 className="text-xl font-semibold mb-2 text-black">
                Interactive Quizzes
              </h3>
              <p className="text-gray-600 mb-4">
                Test your knowledge with interactive quizzes across various
                subjects. Track your progress and improve your scores.
              </p>
              <Link
                href="/dashboard/quiz"
                className={`${isSignedIn ? "" : "pointer-events-none"}`}
              >
                <Button className="mt-auto bg-black hover:bg-gray-800 text-white w-full">
                  {isSignedIn ? "Access Quizzes" : "Sign in to Access"}
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-300"
            variants={boxVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 80 }}
          >
            <div className="bg-white p-4">
              <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="p-5 bg-gray-200 flex-grow">
              <h3 className="text-xl font-semibold mb-2 text-black">Study Materials</h3>
              <p className="text-gray-600 mb-4">
                Access comprehensive notes, PDF resources, and materials
                organized by subject to enhance your learning.
              </p>
              <Link
                href="/dashboard/study-materials"
                className={`${isSignedIn ? "" : "pointer-events-none"}`}
              >
                <Button className="mt-auto bg-black hover:bg-gray-800 text-white w-full">
                  {isSignedIn ? "Browse Materials" : "Sign in to Access"}
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-300"
            variants={boxVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 80 }}
          >
            <div className="bg-white p-4">
              <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center">
                <ScrollText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="p-5 bg-gray-200 flex-grow">
              <h3 className="text-xl font-semibold mb-2 text-black">Flashcards</h3>
              <p className="text-gray-600 mb-4">
                Practice with digital flashcards for improved memory retention
                and quick revision before exams.
              </p>
              <Link
                href="/dashboard/flashcards"
                className={`${isSignedIn ? "" : "pointer-events-none"}`}
              >
                <Button className="mt-auto bg-black hover:bg-gray-800 text-white w-full">
                  {isSignedIn ? "Start Learning" : "Sign in to Access"}
                </Button>
              </Link>
            </div>{" "}
          </motion.div>
        </div>
        <motion.div
          className="w-full mt-16 text-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Blog</h2>
            <div className="w-20 h-1 bg-black mb-1"></div>
            <p className="text-gray-600">
              Get the latest insights from our experts
            </p>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 h-64 lg:h-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent opacity-20"></div>
                <div className="w-full h-full bg-gray-300 overflow-hidden">
                  <Image
                    src="https://litfind.bookscape.com/wp-content/uploads/2025/02/CUET.jpg"
                    alt="Blog Feature Image"
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="lg:w-1/2 p-8 lg:p-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    May 26, 2025
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm">
                    <User className="h-3 w-3 mr-1" />
                    Mr. Krishna Thakur
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm">
                    <Clock className="h-3 w-3 mr-1" />5 min read
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-3">
                  How to Prepare for CUET: A Comprehensive Guide for Students
                </h2>

                <p className="text-gray-700 mb-4">
                  The Common University Entrance Test (CUET) is a crucial step
                  for students looking to secure admission in top universities.
                  This guide covers effective strategies, time management
                  techniques, and subject-specific tips to help you excel in
                  your preparation.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium">
                    CUET Preparation
                  </span>
                  <span className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium">
                    Study Tips
                  </span>
                  <span className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium">
                    Education
                  </span>
                </div>

                <Link
                  href={
                    isSignedIn
                      ? "/dashboard/blogs/comprehensive-guide-cuet-preparation-strategies"
                      : "/sign-in"
                  }
                  className="inline-flex items-center"
                >
                  <Button
                    variant="outline"
                    className="group border-black hover:bg-black hover:text-white transition-colors"
                  >
                    {isSignedIn ? "Read Full Article" : "Sign in to Read"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <footer className="bg-gray-900 text-white py-8 px-4 md:px-16 lg:px-24 w-full">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">About</h3>
              <ul>
                <li>
                  <Link href="/sign-in" className="hover:underline">
                    Our story
                  </Link>
                </li>
                <li>
                  <Link href="/sign-in" className="hover:underline">
                    Our Team
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">PathBreakers</h3>
              <ul>
                <li>
                  <Link href="#services" className="hover:underline">
                    Our services
                  </Link>
                </li>
                <li>
                  <Link href="/sign-in" className="hover:underline">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/sign-in" className="hover:underline">
                    Announcement
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} PathBreakers. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
