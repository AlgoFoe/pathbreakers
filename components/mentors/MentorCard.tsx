"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

// Types for mentor data
export interface MentorProps {
  id: number;
  name: string;
  title: string;
  image: string;
  categories: string[];
  description: string;
  expertise: string[];
  bookingLink: string;
  achievements: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function MentorCard({ mentor }: { mentor: MentorProps }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      className="h-full"
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col">
        <div className="relative h-64 bg-gray-100">
          <Image
            src={mentor.image}
            alt={mentor.name}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
            <p className="text-gray-200">{mentor.title}</p>
          </div>
        </div>
        <CardContent className="p-6 flex-grow flex flex-col">
          <div className="mb-4 flex flex-wrap gap-2">
            {mentor.categories.map((category) => (
              <span
                key={category}
                className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {category}
              </span>
            ))}
          </div>

          <p className="text-gray-600 mb-4">{mentor.description}</p>
          <ul className="text-sm font-medium text-gray-900 mt-auto mb-4 list-disc list-inside">
            {mentor.achievements.split("\n").map((achievement, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full bg-gray-600 inline-block"></span>
                <span className="text-gray-700">{achievement}</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full bg-black text-white"
            onClick={() => window.open(mentor.bookingLink, "_blank")}
          >
            Book a Session <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
