"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  FileQuestion,
  ScrollText,
  User,
  ArrowRight,
  CalendarIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import type { CalendarProps } from "react-calendar";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { getBlogs } from "@/lib/actions/blog.actions";

export default function DashboardPage() {
  const { user } = useUser();
  const [value, setValue] = useState<Date | Date[] | null>(new Date());

  // Get current date info for display
  const currentDateObj =
    value instanceof Date
      ? value
      : Array.isArray(value)
      ? value[0]
      : new Date();
  const year = currentDateObj.getFullYear();
  const month = currentDateObj.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };
  // Blog data would typically be fetched from the server
  // We're using static data here, but you could use getBlogs() to fetch real blog data
  // Course data
  const courses = [
    { title: "CUET 2025 EXAM PREP", progress: 25, batch: "JUNE" },
    { title: "CUET 2025 EXAM PREP", progress: 25, batch: "JUNE" },
    { title: "CUET 2025 EXAM PREP", progress: 25, batch: "JUNE" },
    { title: "CUET 2025 EXAM PREP", progress: 25, batch: "JUNE" },
  ];

  // Feature preview cards
  const featureCards = [
    {
      title: "Quiz",
      description:
        "Test your knowledge with interactive quizzes across various subjects",
      icon: FileQuestion,
      color: "bg-blue-100 text-blue-600",
      path: "/dashboard/quiz",
    },
    {
      title: "Study Materials",
      description:
        "Access comprehensive notes and materials organized by subject",
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-600",
      path: "/dashboard/study-materials",
    },
    {
      title: "Flashcards",
      description:
        "Practice with digital flashcards for improved memory retention",
      icon: ScrollText,
      color: "bg-amber-100 text-amber-600",
      path: "/dashboard/flashcards",
    },
  ];
  // Custom styles for react-calendar
  const calendarStyles = `
    .react-calendar {
      font-family: inherit;
    }
    .react-calendar__tile--now {
      background: transparent !important;
    }
    .react-calendar__tile--active {
      background: #000 !important;
      color: white !important;
      border-radius: 100%;
    }
    .react-calendar__tile:hover {
      background-color: #f3f4f6 !important;
      border-radius: 100%;
    }
    .react-calendar__navigation button:hover {
      background-color: #f3f4f6 !important;
    }
    .react-calendar__tile {
      border-radius: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
    }
  `;
  return (
    <div className="container mx-auto space-y-8 max-w-6xl text-black">
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />{" "}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mt-0"
      >
        <div>
          <h1 className="text-2xl font-bold text-black">
            Hello {user?.firstName || user?.username || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Welcome! Here is your progress report.
          </p>
        </div>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {featureCards.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{
              scale: 1.03,
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            className="cursor-pointer bg-gray-100"
          >
            <Link href={feature.path}>
              <Card className="shadow-sm border border-gray-100 h-full bg-gray-100 rounded-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${feature.color} p-3 rounded-full`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-1 space-y-6"
        >
          {" "}
          <motion.div
            variants={itemVariants}
            className="bg-gray-100 rounded-lg shadow p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">
                {monthNames[month]} {year}
              </h2>
            </div>
            <Calendar
              value={value as any}
              onChange={(nextValue) => {
                setValue(nextValue as Date);
              }}
              className="react-calendar border-0 w-full  bg-gray-100"
              tileClassName={({ date, view }) => {
                if (
                  view === "month" &&
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear()
                ) {
                  return "bg-blue-500 text-white rounded-full";
                }
                return null;
              }}
              formatShortWeekday={(locale, date) =>
                ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][date.getDay()]
              }
            />
          </motion.div>
        </motion.div>{" "}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-2 space-y-6"
        >
          <motion.div variants={itemVariants} className="text-black">
            <Card className="shadow-sm bg-gray-100 text-black">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Featured Blogs</CardTitle>
                  <Link href="/dashboard/blogs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 bg-gray-200"
                    >
                      View all <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
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
                    <div className="lg:w-1/2 p-6 lg:p-8">
                      {" "}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          May 26, 2025
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Pathbreakers
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs">
                          <Clock className="h-3 w-3 mr-1" />5 min read
                        </span>
                      </div>
                      <h2 className="text-xl font-bold mb-2">
                        How to Prepare for CUET: A Comprehensive Guide for
                        Students
                      </h2>
                      <p className="text-gray-700 mb-3 text-sm">
                        The Common University Entrance Test (CUET) is a crucial
                        step for students looking to secure admission in top
                        universities. This guide covers effective strategies,
                        time management techniques, and subject-specific tips.
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="bg-gray-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          CUET
                        </span>
                        <span className="bg-gray-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Study Tips
                        </span>
                        <span className="bg-gray-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Education
                        </span>
                      </div>
                      <Link
                        href="/dashboard/blogs/comprehensive-guide-cuet-preparation-strategies"
                        className="inline-flex items-center"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="group border-black hover:bg-black hover:text-white transition-colors"
                        >
                          Read Full Article
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
