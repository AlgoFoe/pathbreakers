'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "lucide-react";
import axios from "axios";

export default function SeedBlogsButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      console.log("Sending request to seed blogs...");
      const response = await axios.get(`/api/seed/blogs`, {
        params: {
          t: Date.now(),
          resetData: true
        },
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const result = response.data;
      console.log("Seed result:", result);
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error seeding blogs:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to seed blogs",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeed} 
      disabled={isSeeding}
      variant="outline"
      className="bg-white border border-gray-200"
      size="sm"
    >
      <Database className="h-4 w-4 mr-2" />
      {isSeeding ? "Seeding..." : "Seed Sample Blogs"}
    </Button>
  );
}
