"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  User,
  Building2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Create Google Form URL with pre-filled data
    const baseUrl = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";
    const params = new URLSearchParams({
      'entry.NAME_FIELD_ID': formData.name,
      'entry.EMAIL_FIELD_ID': formData.email,
      'entry.PHONE_FIELD_ID': formData.phone,
      'entry.SUBJECT_FIELD_ID': formData.subject,
      'entry.MESSAGE_FIELD_ID': formData.message
    });
    
    // Open Google Form in new tab
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in <span className="text-indigo-700">Touch</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about PathBreakers? We&apos;re here to help you succeed in your academic journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="bg-red-100 p-3 rounded-full">
                      <Phone className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone</h4>
                      <p className="text-gray-600">+91 9822464846</p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">krishnasingh@thepathbreakers.com</p>
                      <p className="text-sm text-gray-500 mt-1">We&apos;ll respond within 24 hours</p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="bg-green-100 p-3 rounded-full">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Location</h4>
                      <p className="text-gray-600">Buldana</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Quick Links */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/dashboard" className="block">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-red-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-gray-900">Dashboard</span>
                      </div>
                    </motion.div>
                  </Link>
                  <Link href="/mentors" className="block">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-red-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-gray-900">Mentorship</span>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-black to-gray-700 text-white rounded-t-lg">
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription className="text-red-100">
                    Fill out the form below and we&apos;ll get back to you soon.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium text-gray-700">Full Name *</label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </motion.div>
                      
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium text-gray-700">Email Address *</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-gray-700">Message *</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        required
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none"
                      />
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleSubmit}
                        variant={"ghost"}
                        className="w-full bg-gray-300 hover:bg-gray-400 py-3 text-lg font-semibold"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;