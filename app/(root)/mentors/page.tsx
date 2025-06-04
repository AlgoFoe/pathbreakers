"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MentorCard, { MentorProps } from "@/components/mentors/MentorCard";
import { getMentors, getCategories } from "@/lib/actions/mentor.actions";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorProps[]>([]);
  const [categories, setCategories] = useState<string[]>(["All", "IPMAT", "CUET", "Career Counselling"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch mentors data
  useEffect(() => {
    const fetchMentorsData = async () => {
      try {
        const mentorsData = await getMentors();
        const categoriesData = await getCategories();
        
        setMentors(mentorsData as MentorProps[]);
        setCategories(categoriesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching mentors data:", error);
        setIsLoading(false);
      }
    };
    
    fetchMentorsData();
  }, []);

  // Filter mentors based on selected category
  const filteredMentors = selectedCategory === "All" 
    ? mentors 
    : mentors.filter(mentor => mentor.categories.includes(selectedCategory));

  return (
    <div className="min-h-screen bg-white">
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our <span className="text-indigo-600">Expert Mentors</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-600">
              Connect with our experienced mentors who are dedicated to helping you achieve your academic and career goals.
              Book personalized sessions to get guidance tailored to your specific needs.
            </p>
          </div>          <div className="mb-10">
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  className={category === selectedCategory 
                    ? "bg-black" 
                    : "text-gray-700 hover:bg-gray-100"
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading placeholders
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="shadow-lg h-full">
                  <div className="h-64 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mb-6 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mt-6 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))            ) : (
              filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))
            )}{/* Placeholder for more mentors - shown when there are fewer than 3 mentors */}
            {filteredMentors.length < 3 && (
              <Card className="shadow-md border-2 border-dashed border-gray-300 bg-gray-50 h-full flex flex-col items-center justify-center p-8 text-center">
                <CardContent className="flex flex-col items-center justify-center">
                  <h3 className="text-xl font-medium text-gray-600 mb-4">More Mentors Coming Soon</h3>
                  <p className="text-gray-500">
                    We&apos;re expanding our team of expert mentors to provide you with the best guidance. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>          <Card className="mt-16 max-w-3xl mx-auto bg-gray-50 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Request a Mentorship Session</h2>
              <p className="text-gray-600 mb-6">
                Don&apos;t see a mentor that matches your specific needs? Fill out our request form and we&apos;ll connect you with the right expert for your academic goals.
              </p>
              <Button 
                className="bg-black text-white"
                onClick={() => window.open("https://forms.gle/general-mentorship-request", "_blank")}
              >
                Request Custom Mentorship <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
