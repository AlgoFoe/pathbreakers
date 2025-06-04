"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AdminDebugPanel() {
  const { user, isLoaded } = useUser();
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch debug data from the API
  const fetchDebugData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/debug');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDebugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching admin debug data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load debug data on component mount
  useEffect(() => {
    if (isLoaded && user) {
      fetchDebugData();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admin Status Check</CardTitle>
          <CardDescription>Loading user information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admin Status Check</CardTitle>
          <CardDescription>You must be logged in to use this tool</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-500">
            <AlertCircle className="h-5 w-5" />
            <span>Not authenticated</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between">
          Admin Status Check
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDebugData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Check if your account has admin access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-5 w-5" />
              <span>Error checking admin status</span>
            </div>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : debugData ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium">
              {debugData.isAdmin ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-green-600">Admin access confirmed</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                  <span className="text-amber-600">Not an admin</span>
                </>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Current User Email</h3>
              <div className="p-2 bg-muted rounded text-sm">
                {user.primaryEmailAddress?.emailAddress}
              </div>
            </div>

            <div className="p-4 border rounded-md bg-muted">
              <p className="text-sm text-muted-foreground">
                Admin status is determined by checking if your email matches the admin email.
                If you need admin access, please contact the system administrator.
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
