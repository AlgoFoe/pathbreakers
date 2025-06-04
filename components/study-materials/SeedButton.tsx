'use client';

import { Button } from "@/components/ui/button";
import { seedMaterials } from "@/lib/actions/seed-materials";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function SeedButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedMaterials();
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed study materials",
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
    >
      {isSeeding ? "Seeding..." : "Seed Study Materials"}
    </Button>
  );
}
