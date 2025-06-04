"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, Users, FileQuestion, BookOpen, Activity,
  TrendingUp, ChevronRight
} from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

function StatCard({ title, value, description, icon, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className={`p-2 rounded-full ${color}`}>
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface QuickLinkProps {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

function QuickLink({ href, label, description, icon, delay }: QuickLinkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link href={href}>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                {icon}
              </div>
              <div>
                <h4 className="font-semibold">{label}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    blogs: "0",
    users: "0",
    quizzes: "0",
    flashcards: "0"
  });

  useEffect(() => {
    // In a real app, fetch actual stats from API
    setStats({
      blogs: "24",
      users: "1,257",
      quizzes: "46",
      flashcards: "132"
    });
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.h1 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-8"
      >
        Admin Dashboard
      </motion.h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Blogs" 
            value={stats.blogs} 
            description="Published articles" 
            icon={<FileText className="text-blue-500" size={18} />}
            color="bg-sky-100 dark:bg-sky-900/30"
            delay={0.1}
          />
          <StatCard 
            title="Total Users" 
            value={stats.users} 
            description="Registered accounts" 
            icon={<Users className="text-lightPink-600" size={18} />}
            color="bg-teal-100 dark:bg-teal-700/30"
            delay={0.2}
          />
          <StatCard 
            title="Quizzes" 
            value={stats.quizzes} 
            description="Active quizzes" 
            icon={<FileQuestion className="text-purple-500" size={18} />}
            color="bg-purple-100 dark:bg-purple-900/30"
            delay={0.3}
          />
          <StatCard 
            title="Flashcards" 
            value={stats.flashcards} 
            description="Created cards" 
            icon={<BookOpen className="text-amber-500" size={18} />}
            color="bg-amber-100 dark:bg-amber-900/30"
            delay={0.4}
          />
        </div>
      </section>
      
      <section className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <QuickLink
              href="/admin/blogs/new"
              label="Create New Blog"
              description="Write and publish a new article"
              icon={<FileText size={18} />}
              delay={0.5}
            />
            <QuickLink
              href="/admin/quizzes/new"
              label="Add New Quiz"
              description="Create and configure a new quiz"
              icon={<FileQuestion size={18} />}
              delay={0.6}
            />
            <QuickLink
              href="/admin/flashcards/new"
              label="Create Flashcards"
              description="Add new flashcard category or cards"
              icon={<BookOpen size={18} />}
              delay={0.7}
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <motion.ul 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="divide-y"
              >
                {[
                  { action: "Blog published", item: "CUET preparation tips", time: "2 hours ago" },
                  { action: "Quiz updated", item: "History practice test", time: "Yesterday" },
                  { action: "User registered", item: "varun@gmail.com", time: "Yesterday" },
                  { action: "Flashcards created", item: "Biology terminology", time: "2 days ago" },
                  { action: "System update", item: "Version 1.2.4", time: "3 days ago" }
                ].map((activity, index) => (
                  <motion.li 
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                    }}
                    className="px-4 py-3 flex items-center"
                  >
                    <div className="p-2 bg-muted rounded-full mr-3">
                      <Activity size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action}: <span className="text-muted-foreground">{activity.item}</span></p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">User Engagement</h3>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-green-500" size={16} />
                <span className="text-sm font-medium text-green-500">+12.4%</span>
              </div>
            </div>
            
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              [Chart Component Placeholder]
              <p>User engagement and activity metrics visualization would appear here</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
