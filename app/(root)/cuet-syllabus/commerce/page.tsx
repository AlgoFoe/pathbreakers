"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, BookOpen, GraduationCap, ArrowRight, Calendar, Clock, BookMarked, HandCoins, CandlestickChart, Sigma } from "lucide-react";

// Detailed syllabus content for each subject
const subjects = [
  {
    id: "accountancy",
    name: "Accountancy",
    description: "Focuses on financial transactions and record-keeping.",
    icon: <HandCoins className="h-6 w-6 text-blue-500" />,
    units: [
      {
        title: "Introduction to Accounting",
        topics: [
          "Accounting Standards and Concepts",
          "Double Entry System",
          "Books of Original Entry",
          "Preparation of Trial Balance",
          "Bank Reconciliation Statement"
        ]
      },
      {
        title: "Financial Statements",
        topics: [
          "Preparation of Financial Statements",
          "Accounting for Not-for-Profit Organizations",
          "Accounting for Partnership Firms",
          "Analysis of Financial Statements",
          "Cash Flow Statements"
        ]
      },
      {
        title: "Advanced Accounting",
        topics: [
          "Issue of Shares and Debentures",
          "Redemption of Shares and Debentures",
          "Accounting for Companies",
          "Financial Statement Analysis",
          "Computerized Accounting System"
        ]
      }
    ]
  },
  {
    id: "business",
    name: "Business Studies",
    description: "Covers business operations and management principles.",
    icon: <GraduationCap className="h-6 w-6 text-purple-500" />,
    units: [
      {
        title: "Nature and Purpose of Business",
        topics: [
          "Forms of Business Organizations",
          "Business Services",
          "Emerging Modes of Business",
          "Social Responsibility of Business",
          "Business Ethics"
        ]
      },
      {
        title: "Principles and Functions of Management",
        topics: [
          "Nature and Significance of Management",
          "Planning, Organizing, Staffing",
          "Directing and Controlling",
          "Business Finance and Marketing",
          "Consumer Protection"
        ]
      },
      {
        title: "Business Environment",
        topics: [
          "Economic Environment",
          "Political and Legal Environment",
          "Social and Technological Environment",
          "Global Environment",
          "Business Strategic Responses"
        ]
      }
    ]
  },
  {
    id: "economics",
    name: "Economics",
    description: "Studies the production, distribution, and consumption of goods and services.",
    icon: <CandlestickChart  className="h-6 w-6 text-green-500" />,
    units: [
      {
        title: "Introductory Microeconomics",
        topics: [
          "Introduction to Economics",
          "Consumer Behavior and Demand",
          "Producer Behavior and Supply",
          "Market Equilibrium",
          "Price Elasticity of Demand and Supply"
        ]
      },
      {
        title: "Introductory Macroeconomics",
        topics: [
          "National Income Accounting",
          "Money and Banking",
          "Determination of Income and Employment",
          "Government Budget and the Economy",
          "Balance of Payments"
        ]
      },
      {
        title: "Indian Economic Development",
        topics: [
          "Development Experience (1947-90)",
          "Economic Reforms since 1991",
          "Current Challenges facing Indian Economy",
          "Development Experience of India",
          "Comparative Study with Neighbors"
        ]
      }
    ]
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Involves the study of numbers, quantities, and shapes.",
    icon: <Sigma className="h-6 w-6 text-red-500" />,
    units: [
      {
        title: "Algebra",
        topics: [
          "Relations and Functions",
          "Matrices and Determinants",
          "Continuity and Differentiability",
          "Applications of Derivatives",
          "Indefinite and Definite Integrals"
        ]
      },
      {
        title: "Calculus",
        topics: [
          "Applications of Integrals",
          "Differential Equations",
          "Vector Algebra",
          "Three-dimensional Geometry",
          "Linear Programming"
        ]
      },
      {
        title: "Statistics and Probability",
        topics: [
          "Probability Distribution",
          "Binomial Distribution",
          "Random Variables and Probability Functions",
          "Correlation and Regression",
          "Statistical Analysis"
        ]
      }
    ]
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    description: "Explores the process of starting and managing new businesses.",
    icon: <GraduationCap className="h-6 w-6 text-yellow-500" />,
    units: [
      {
        title: "Entrepreneurial Opportunity",
        topics: [
          "Entrepreneurial Process and Ideas",
          "Business Environment Analysis",
          "Opportunity Assessment",
          "Market Feasibility Study",
          "Technical and Financial Viability"
        ]
      },
      {
        title: "Enterprise Planning",
        topics: [
          "Business Plans",
          "Organizational Structure",
          "Marketing Strategy",
          "Financial Plans and Projections",
          "Legal Requirements for a Business"
        ]
      },
      {
        title: "Enterprise Management",
        topics: [
          "Resource Mobilization",
          "Business Finance and Growth",
          "Managing Small Business",
          "Business Risk Management",
          "Use of Technology and Innovation"
        ]
      }
    ]
  }
];

// Preparation guide timeline
const prepTimeline = [
  {
    phase: "6-8 Months Before",
    tasks: [
      "Understand the complete CUET syllabus and exam pattern",
      "Make a study plan covering all subjects",
      "Start with NCERT books for all subjects",
      "Take a diagnostic test to identify your strengths and weaknesses"
    ],
    icon: <Calendar className="h-5 w-5 text-blue-600" />
  },
  {
    phase: "3-5 Months Before",
    tasks: [
      "Complete the entire syllabus once",
      "Focus more on difficult topics",
      "Start solving previous years' question papers",
      "Join a test series to practice regularly"
    ],
    icon: <Clock className="h-5 w-5 text-purple-600" />
  },
  {
    phase: "1-2 Months Before",
    tasks: [
      "Revise all subjects thoroughly",
      "Focus on solving more mock tests",
      "Analyze your performance and work on weak areas",
      "Practice time management during mock tests"
    ],
    icon: <BookMarked className="h-5 w-5 text-green-600" />
  }
];

// Reference books for CUET Commerce
const referenceBooks = [
  {
    subject: "Accountancy",
    books: [
      "NCERT Accountancy - Class 11 & 12",
      "TS Grewal's Double Entry Book Keeping",
      "DK Goel's Accountancy",
      "CUET Guide for Accountancy"
    ]
  },
  {
    subject: "Business Studies",
    books: [
      "NCERT Business Studies - Class 11 & 12",
      "Poonam Gandhi's Business Studies",
      "Case Studies in Business Studies by Sandeep Garg",
      "CUET Guide for Business Studies"
    ]
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.03 }
};
const unitVariants = {
  closed: { height: 0, opacity: 0, overflow: "hidden", transition: { duration: 0.3 } },
  open: { height: "auto", opacity: 1, overflow: "visible", transition: { duration: 0.3 } }
};

const CommerceSyllabus = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [expandedUnits, setExpandedUnits] = useState<{ [key: string]: boolean }>({});

  const toggleUnit = (subjectId: string, unitIndex: number) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [`${subjectId}-${unitIndex}`]: !prev[`${subjectId}-${unitIndex}`]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Commerce Guide</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Responsive TabsList */}
        <div className="mb-6">
          <div className="block md:hidden">
            <TabsList className="flex-nowrap overflow-x-auto overflow-y-hidden flex gap-2 bg-gray-200 h-14 px-1 scrollbar-thin scrollbar-thumb-gray-300">
              <div className="pl-72 flex">
          <TabsTrigger value="overview" className="text-sm py-3 min-w-max">
            Overview
          </TabsTrigger>
          {subjects.map((subject) => (
            <TabsTrigger key={subject.id} value={subject.id} className="text-sm py-3 min-w-max">
              {subject.name}
            </TabsTrigger>
          ))}
              </div>
            </TabsList>
          </div>
          {/* For medium and up: normal tab bar */}
          <div className="hidden md:block">
            <TabsList className="mb-0 flex flex-wrap gap-2 bg-gray-200 h-14">
              <TabsTrigger value="overview" className="text-sm md:text-base py-3">
          Overview
              </TabsTrigger>
              {subjects.map((subject) => (
          <TabsTrigger key={subject.id} value={subject.id} className="text-sm md:text-base py-3">
            {subject.name}
          </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
        <TabsContent value="overview">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map((subject) => (
              <motion.div
          key={subject.id}
          variants={itemVariants}
          whileHover="hover"
          initial="initial"
          animate="animate"
          className="cursor-pointer"
          onClick={() => setActiveTab(subject.id)}
              >
          <Card className="h-full border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-gray-50 p-2 rounded-lg">
                {subject.icon}
              </div>
              <div>
                <CardTitle className="text-xl">{subject.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{subject.description}</p>
              <ul className="space-y-1">
                {subject.units.map((unit, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              {unit.title}
            </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <div className="text-blue-600 flex items-center text-sm">
            View syllabus <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </CardContent>
          </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {subjects.map((subject) => (
          <TabsContent key={subject.id} value={subject.id}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              {subject.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{subject.name}</h2>
              <p className="text-gray-600 mt-1">{subject.description}</p>
            </div>
          </div>
              </div>
              
              <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Subject Units</h3>
          
          <motion.div className="space-y-4">
            {subject.units.map((unit, unitIndex) => {
              const isExpanded = expandedUnits[`${subject.id}-${unitIndex}`] || false;
              return (
                        <motion.div 
                          key={unitIndex}
                          variants={itemVariants}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div 
                            className={`p-4 flex justify-between items-center cursor-pointer ${isExpanded ? 'bg-blue-50' : 'bg-white'}`}
                            onClick={() => toggleUnit(subject.id, unitIndex)}
                          >
                            <h4 className="text-lg font-medium text-gray-800">{unit.title}</h4>
                            <button className="p-1 rounded-full hover:bg-gray-100">
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ArrowRight className="h-5 w-5 text-gray-600" />
                              </motion.div>
                            </button>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial="closed"
                                animate="open"
                                exit="closed"
                                variants={unitVariants}
                              >
                                <div className="p-4 bg-gray-50 border-t border-gray-200">
                                  <ul className="space-y-2">
                                    {unit.topics.map((topic, topicIndex) => (
                                      <motion.li 
                                        key={topicIndex}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: topicIndex * 0.1 }}
                                        className="flex items-start"
                                      >
                                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                        <span className="text-gray-700">{topic}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                  
                  <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Study Tips</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Focus on NCERT textbooks for building a strong foundation
                      </li>
                      <li className="flex items-center text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Practice previous years&apos; questions for exam familiarity
                      </li>
                      <li className="flex items-center text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Make concise notes for quick revision before the exam
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default CommerceSyllabus;
