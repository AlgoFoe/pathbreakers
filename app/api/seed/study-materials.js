import { connectToDatabase } from "../../../lib/database/mongoose";
import StudyMaterial from "../../../lib/database/models/study-material.model";

/**
 * Seeds the database with initial study materials
 */
export const seedStudyMaterials = async () => {
  try {
    await connectToDatabase();
    
    // Check if we already have study materials
    const existingCount = await StudyMaterial.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} study materials. Skipping seed.`);
      return { success: true, message: `Database already has ${existingCount} study materials` };
    }
    
    const studyMaterials = [
      {
        title: "CUET Physics Complete Notes",
        description: "Comprehensive physics notes covering all CUET topics",
        fileUrl: "/sample.pdf",
        fileType: "PDF",
        fileSize: 5.2 * 1024 * 1024, // 5.2 MB in bytes
        category: "Physics",
        uploadDate: new Date("2025-04-15"),
      },
      {
        title: "Chemistry Formulas and Reactions",
        description: "Quick reference guide for chemistry formulas and reactions",
        fileUrl: "/sample.pdf",
        fileType: "PDF",
        fileSize: 3.8 * 1024 * 1024, // 3.8 MB in bytes
        category: "Chemistry",
        uploadDate: new Date("2025-04-18"),
      },
      {
        title: "Mathematics Practice Problems",
        description: "Collection of practice problems with solutions",
        fileUrl: "/sample.pdf",
        fileType: "PDF",
        fileSize: 7.1 * 1024 * 1024, // 7.1 MB in bytes
        category: "Mathematics",
        uploadDate: new Date("2025-04-20"),
      },
      {
        title: "English Grammar Guide",
        description: "Comprehensive grammar guide with examples",
        fileUrl: "/sample.pdf",
        fileType: "PDF",
        fileSize: 4.5 * 1024 * 1024, // 4.5 MB in bytes
        category: "English",
        uploadDate: new Date("2025-04-22"),
      },
      {
        title: "Biology Diagrams and Notes",
        description: "Visual guide to important biology concepts",
        fileUrl: "/sample.pdf",
        fileType: "PDF",
        fileSize: 6.3 * 1024 * 1024, // 6.3 MB in bytes
        category: "Biology",
        uploadDate: new Date("2025-04-25"),
      },
      {
        title: "General Knowledge Compilation",
        description: "Current affairs and general knowledge for competitive exams",
        fileUrl: "/sample.pdf",
        fileType: "PDF",
        fileSize: 5.7 * 1024 * 1024, // 5.7 MB in bytes
        category: "General Knowledge",
        uploadDate: new Date("2025-05-01"),
      },
    ];
    
    await StudyMaterial.insertMany(studyMaterials);
    
    console.log(`Successfully seeded ${studyMaterials.length} study materials`);
    return { success: true, message: `Successfully seeded ${studyMaterials.length} study materials` };
  } catch (error) {
    console.error("Error seeding study materials:", error);
    return { success: false, message: "Failed to seed study materials" };
  }
};
