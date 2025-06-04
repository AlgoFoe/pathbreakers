"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authenticateAdmin, checkAdminAuth, logoutAdmin } from "../auth";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if already logged in or handling logout
  useEffect(() => {
    async function checkAuth() {
      // Check for logout parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const isLogout = urlParams.get('logout') === 'true';
      
      if (isLogout) {
        // Handle logout
        await logoutAdmin();
        toast({
          title: "Logged out successfully",
          description: "You have been signed out of the admin panel"
        });
        setIsCheckingAuth(false);
        return;
      }
      
      // Check if already authenticated
      const isAdmin = await checkAdminAuth();
      
      if (isAdmin) {
        console.log("User already authenticated as admin");
        router.push("/admin/dashboard");
        return;
      }
      
      setIsCheckingAuth(false);
    }
    
    checkAuth();
  }, [router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authenticateAdmin(email, password);
      
      if (result.authenticated) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        router.push("/admin/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: result.error || "Invalid credentials",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Image src="/assets/images/logo-admin.png" alt="Logo" width={80} height={80} className="rounded-full" />
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pathbreakers.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}