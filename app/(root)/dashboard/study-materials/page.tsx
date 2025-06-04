"use client";

import UploadDialog from "@/components/study-materials/UploadDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ChevronDown, Download, Eye, FileIcon, FileText, Folder, PlusCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";

// Define types for our study materials
interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  category: string;
  uploadDate: string;
  thumbnailUrl?: string;
}

const StudyMaterials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Mock categories - replace with actual data from your API
  const categories = ["All", "Physics", "Chemistry", "Mathematics", "Biology", "English", "General Knowledge"];
  // Fetch data from API
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        if (selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }
        if (searchQuery) {
          params.append("query", searchQuery);
        }
        
        // Make API call
        const response = await fetch(`/api/study-materials?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch study materials");
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Transform API data to match our frontend type
          const formattedData = result.data.map((item: any) => ({
            id: item._id,
            title: item.title,
            description: item.description,
            fileUrl: item.fileUrl,
            fileType: item.fileType,
            fileSize: `${(item.fileSize / 1024 / 1024).toFixed(1)} MB`,
            category: item.category,
            uploadDate: new Date(item.uploadDate).toISOString().split('T')[0],
            thumbnailUrl: item.thumbnailUrl
          }));
          
          setMaterials(formattedData);
        } else {
          // If API returns success: false
          console.error("API returned error:", result.message);              // Use mock data as fallback during development
          setMaterials([
            {
              id: "1",
              title: "CUET Physics Complete Notes",
              description: "Comprehensive physics notes covering all CUET topics",
              fileUrl: "/sample.pdf",
              fileType: "PDF",
              fileSize: "5.2 MB",
              category: "Physics",
              uploadDate: "2025-04-15"
            },
            {              id: "2",
              title: "Chemistry Formulas and Reactions",
              description: "Quick reference guide for chemistry formulas and reactions",
              fileUrl: "/sample.pdf",
              fileType: "PDF",
              fileSize: "3.8 MB",
              category: "Chemistry",
              uploadDate: "2025-04-18"
            },
            {
              id: "3",
              title: "Mathematics Practice Problems",
              description: "Collection of practice problems with solutions",
              fileUrl: "/sample.pdf",
              fileType: "PDF",
              fileSize: "7.1 MB",
              category: "Mathematics",
              uploadDate: "2025-04-20"
            },
            {
              id: "4",
              title: "English Grammar Guide",
              description: "Comprehensive grammar guide with examples",
              fileUrl: "/sample.pdf",
              fileType: "PDF",
              fileSize: "4.5 MB",
              category: "English",
              uploadDate: "2025-04-22"
            },
            {
              id: "5",
              title: "Biology Diagrams and Notes",
              description: "Visual guide to important biology concepts",
              fileUrl: "/sample.pdf",
              fileType: "PDF",
              fileSize: "6.3 MB",
              category: "Biology",
              uploadDate: "2025-04-25"
            },
            {
              id: "6",
              title: "General Knowledge Compilation",
              description: "Current affairs and general knowledge for competitive exams",
              fileUrl: "/sample.pdf",
              fileType: "PDF",
              fileSize: "5.7 MB",
              category: "General Knowledge",
              uploadDate: "2025-05-01"
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch study materials:", error);
        // Use mock data as fallback
        setMaterials([          {
            id: "1",
            title: "CUET Physics Complete Notes",
            description: "Comprehensive physics notes covering all CUET topics",
            fileUrl: "/sample.pdf",
            fileType: "PDF",
            fileSize: "5.2 MB",
            category: "Physics",
            uploadDate: "2025-04-15"
          },
          {
            id: "2",
            title: "Chemistry Formulas and Reactions",
            description: "Quick reference guide for chemistry formulas and reactions",
            fileUrl: "/sample.pdf",
            fileType: "PDF",
            fileSize: "3.8 MB",
            category: "Chemistry",
            uploadDate: "2025-04-18"
          },
          // More mock items...
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [selectedCategory, searchQuery]);

  // Filter materials based on search query and category
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewMaterial = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setIsViewerOpen(true);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl text-black">
      {/* Search and filter section */}      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            className="pl-10 bg-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />        </div>        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-gray-100"
              >
                <Folder className="h-4 w-4" />
                {selectedCategory}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Select Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  className={selectedCategory === category ? "font-medium bg-gray-100" : ""}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Upload
          </Button>
        </div>
      </div>
      
      {/* Upload Dialog */}
      <UploadDialog 
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadSuccess={() => {
          // Refresh materials after successful upload
          const fetchMaterials = async () => {
            const params = new URLSearchParams();
            if (selectedCategory !== "All") {
              params.append("category", selectedCategory);
            }
            const response = await fetch(`/api/study-materials?${params.toString()}`);
            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                const formattedData = result.data.map((item: any) => ({
                  id: item._id,
                  title: item.title,
                  description: item.description,
                  fileUrl: item.fileUrl,
                  fileType: item.fileType,
                  fileSize: `${(item.fileSize / 1024 / 1024).toFixed(1)} MB`,
                  category: item.category,
                  uploadDate: new Date(item.uploadDate).toISOString().split('T')[0],
                  thumbnailUrl: item.thumbnailUrl
                }));
                setMaterials(formattedData);
              }
            }
          };
          fetchMaterials();
        }}
        categories={categories.filter(category => category !== "All")}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <motion.div key={material.id} variants={itemVariants}>
                <Card className="overflow-hidden border border-gray-100 bg-gray-100 h-full hover:shadow-md transition-shadow duration-200 flex flex-col">
                  <CardContent className="p-6 flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-full">
                        {getFileIcon(material.fileType)}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold line-clamp-2">{material.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-600 hover:bg-blue-200">
                            {material.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{material.fileSize}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 bg-gray-200 border-t border-gray-100 flex justify-between mt-auto">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bg-gray-300 text-black hover:text-gray-800 hover:bg-gray-400"
                      onClick={() => handleViewMaterial(material)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bg-gray-300 text-black hover:text-gray-800 hover:bg-gray-400"
                      onClick={() => window.open(`/study-materials${material.fileUrl}`, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold">No materials found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </motion.div>
      )}
      
      {/* PDF Viewer Dialog */}
      {selectedMaterial && (
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw]">
            <DialogHeader>
              <DialogTitle>{selectedMaterial.title}</DialogTitle>
            </DialogHeader>            <div className="mt-4 h-[calc(90vh-10rem)]">
              <div className="mb-2 text-xs text-gray-500">File path: {`/study-materials${selectedMaterial.fileUrl}`}</div>
              <object
                data={`/study-materials${selectedMaterial.fileUrl}`}
                type="application/pdf"
                className="w-full h-full rounded-md"
              >                
                <p>
                  It appears your browser does not support embedded PDFs.
                  <a href={`/study-materials${selectedMaterial.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">
                    Download the PDF
                  </a>
                </p>
              </object>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Seed Button - Admins only */}
      {/* <div className="flex justify-end">
        <SeedButton />
      </div> */}
    </div>
  );
};

export default StudyMaterials;