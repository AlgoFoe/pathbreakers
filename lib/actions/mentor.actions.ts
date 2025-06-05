"use server";

// Define the Mentor type
export interface Mentor {
  id: number;
  name: string;
  title: string;
  image: string;
  categories: string[];
  description: string;
  bookingLink: string;
  achievements: string;
}

// Sample data for mentors
const mentors: Mentor[] = [
  {
    id: 1,
    name: "Krishnasingh Thakur",
    title: "IPMAT & CUET Expert",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&h=300&auto=format&fit=crop",
    categories: ["IPMAT", "CUET"],
    description: "Mr. Krishnasingh Thakur is an experienced mentor with years of expertise in guiding students through IPMAT and CUET preparation. He has helped hundreds of students achieve their dreams of getting into top institutions.",
    bookingLink: "https://forms.gle/your-google-form-link",
    achievements: "(Founder PathBreakers) IIIT NAGPUR\nCareer coach\nMentored 1800+ students\nBuilt 2 businesses\nGrowth and Marketing Consultant"
  },
];

// Get all mentors
export async function getMentors(): Promise<Mentor[]> {
  return mentors;
}

// Get a specific mentor by ID
export async function getMentorById(id: number): Promise<Mentor | null> {
  const mentor = mentors.find(m => m.id === id);
  return mentor || null;
}

// Get mentors by category
export async function getMentorsByCategory(category: string): Promise<Mentor[]> {
  if (category === "All") {
    return mentors;
  }
  
  return mentors.filter(mentor => mentor.categories.includes(category));
}

// Get all unique categories
export async function getCategories(): Promise<string[]> {
  const categorySet = new Set<string>();
  
  // Always include "All" as the first category
  categorySet.add("All");
  
  // Add categories from mentors
  mentors.forEach(mentor => {
    mentor.categories.forEach(category => {
      categorySet.add(category);
    });
  });
  
  // Add additional common categories that might not be in the current mentor data
  categorySet.add("IPMAT");
  categorySet.add("CUET");
  categorySet.add("Career Counselling");
  
  return Array.from(categorySet);
}
