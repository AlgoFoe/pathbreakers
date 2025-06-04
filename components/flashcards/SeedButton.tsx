'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "lucide-react";

export default function SeedFlashcardsButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch('/api/seed/flashcards');
      const result = await response.json();
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed flashcards",
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
      {isSeeding ? "Seeding..." : "Seed Sample Flashcards"}
    </Button>
  );
}
