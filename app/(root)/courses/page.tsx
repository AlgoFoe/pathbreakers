"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Users, 
  Trophy, 
  Clock, 
  Bell, 
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from "lucide-react";
import Link from "next/link";

const ComingSoonCoursesPage = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const launchDate = new Date('2025-09-01T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNotifyMe = () => {
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // Here you would typically send the email to your backend
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const upcomingFeatures = [
    {
      icon: BookOpen,
      title: "Comprehensive Curriculum",
      description: "Expertly crafted courses covering all aspects of your academic journey"
    },
    {
      icon: Users,
      title: "Live Interactive Sessions",
      description: "Real-time learning with experts and peer collaboration"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="bg-gradient-to-r from-black to-gray-700 text-white px-6 py-2 rounded-full text-sm font-medium">
                🚀 Coming Soon
              </div>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Our <span className="text-red-600">Courses</span> Are
              <br />
              <span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                Almost Ready
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get ready for an exceptional learning experience with PathBreakers. 
              Our comprehensive course platform is launching soon with cutting-edge content 
              designed to accelerate your academic success.
            </p>

            {/* Countdown Timer */}
            {/* <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12"
            >
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={cardVariants}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
                >
                  <div className="text-3xl font-bold text-gray-900">{item.value.toString().padStart(2, '0')}</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">{item.label}</div>
                </motion.div>
              ))}
            </motion.div> */}
          </motion.div>

          {/* Notify Me Section */}
          {/* <motion.div variants={itemVariants} className="text-center mb-16">
            <Card className="max-w-md mx-auto shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-black to-gray-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Bell className="h-5 w-5" />
                  Get Notified First
                </CardTitle>
                <CardDescription className="text-red-100">
                  Be the first to know when our courses go live
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!isSubscribed ? (
                  <div className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                    <Button
                      onClick={handleNotifyMe}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      disabled={!email}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notify Me
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center py-4"
                  >
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">You&apos;re All Set!</h3>
                    <p className="text-gray-600">We&apos;ll notify you as soon as our courses are available.</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div> */}

          {/* Features Preview */}
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What&apos;s Coming Your Way
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                >
                  <Card className="h-full shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        className="inline-block mb-4"
                      >
                        <div className="bg-red-100 p-4 rounded-full group-hover:bg-red-200 transition-colors">
                          <feature.icon className="h-8 w-8 text-red-600" />
                        </div>
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} className="text-center">
            <Card className="bg-gradient-to-r from-black to-gray-700 text-white border-0">
              <CardContent className="p-12">
                <Star className="h-12 w-12 text-red-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Transform Your Learning Journey?
                </h2>
                <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of students who are already part of the PathBreakers community. 
                  Explore our current offerings while you wait for the courses.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button 
                      variant="outline" 
                      className="bg-white text-black hover:bg-gray-100 border-white"
                    >
                      Visit Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/mentors">
                    <Button 
                      variant="outline" 
                      className="bg-transparent text-white border-white hover:bg-white hover:text-black"
                    >
                      Find a Mentor
                      <Users className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoonCoursesPage;