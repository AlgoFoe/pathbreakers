"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { checkAdminAuth } from "./auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, FileText, BookCheck, Zap, Users, 
  BarChart2, Settings, LogOut, ChevronRight, ChevronLeft, Menu
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}

function NavItem({ href, icon, label, active, collapsed }: NavItemProps) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                 ${active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}>
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isLoginPage = pathname === "/admin/login";
  useEffect(() => {
    setIsMounted(true);
    
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }
    
    const checkAuth = async () => {
      try {
        // Since middleware already verifies admin status, this is just a double-check
        // This is primarily used for UI/UX purposes in the admin layout component
        const isAdmin = await checkAdminAuth();
        setIsAuthorized(isAdmin);
        
        if (!isAdmin) {
          console.log("User is not authorized as admin, redirecting to login");
          redirect("/admin/login");
        }
      } catch (error) {
        console.error("Error checking admin authentication:", error);
        redirect("/admin/login");
      }
    };
    
    checkAuth();
  }, [isLoginPage]);

  // Show nothing while checking auth to prevent flickering
  if (!isMounted || (!isAuthorized && !isLoginPage)) {
    return null;
  }

  // If it's the login page, render without the admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }
  const navItems = [
    { href: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { href: "/admin/blogs", icon: <FileText size={20} />, label: "Blogs" },
    { href: "/admin/quizzes", icon: <BookCheck size={20} />, label: "Quizzes" },
    { href: "/admin/flashcards", icon: <Zap size={20} />, label: "Flashcards" },
    { href: "/admin/question-banks", icon: <FileText size={20} />, label: "Question Banks" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex flex-col border-r bg-card shadow-sm h-full"
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 border-b h-16`}>
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Image src="/assets/images/logo-admin.png" alt="Logo" width={40} height={40} className="rounded-full" />
              <span className="font-semibold">PathBreakers</span>
            </Link>
          )}
          {collapsed && (
            <Image src="/assets/images/logo-admin.png" alt="Logo" width={32} height={32} className="rounded-full" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? 'mx-auto' : ''}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </ScrollArea>
          <div className="p-4 border-t mt-auto">
          <button 
            onClick={() => {
              // Use window.location to ensure complete redirect after logout
              window.location.href = "/admin/login?logout=true";
            }} 
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground/70 w-full text-left"
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center border-b h-16 px-4 sticky top-0 bg-background z-30 w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-start gap-2 p-4 border-b">
                <Image src="/assets/images/logo-admin.png" alt="Logo" width={32} height={32} className="rounded-full" />
                <span className="font-semibold">Pathbreakers Admin</span>
              </div>
              <ScrollArea className="flex-1">
                <nav className="flex flex-col gap-1 p-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                ${pathname.startsWith(item.href) 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </ScrollArea>              <div className="p-4 border-t">
                <button 
                  onClick={() => {
                    // Use window.location to ensure complete redirect after logout
                    window.location.href = "/admin/login?logout=true";
                  }}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground/70 w-full text-left"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-4 flex-1 flex justify-center">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/assets/images/logo-admin.png" alt="Logo" width={24} height={24} className="rounded-full" />
            <span className="font-semibold">Pathbreakers Admin</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}