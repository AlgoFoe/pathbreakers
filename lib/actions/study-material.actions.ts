import { connectToDatabase } from "../database/mongoose";
import StudyMaterial, { IStudyMaterial } from "../database/models/study-material.model";

// Get all study materials with optional filtering
export async function getAllStudyMaterials(
  category?: string,
  searchQuery?: string
): Promise<IStudyMaterial[]> {
  try {
    await connectToDatabase();

    // Build the search filter
    const filter: any = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }    // Get study materials
    const studyMaterials = await StudyMaterial.find(filter)
      .sort({ uploadDate: -1 })
      .lean();

    return studyMaterials as unknown as IStudyMaterial[];
  } catch (error) {
    console.error("Error fetching study materials:", error);
    throw error;
  }
}

// Get a specific study material by ID
export async function getStudyMaterialById(
  materialId: string
): Promise<IStudyMaterial | null> {
  try {
    await connectToDatabase();
      const material = await StudyMaterial.findById(materialId).lean();
    
    return material as unknown as IStudyMaterial | null;
  } catch (error) {
    console.error("Error fetching study material:", error);
    throw error;
  }
}

// Create a new study material
export async function createStudyMaterial(
  materialData: Partial<IStudyMaterial>,
  userId: string
): Promise<IStudyMaterial> {
  try {
    await connectToDatabase();

    const newMaterial = await StudyMaterial.create({
      ...materialData,
      createdBy: userId,
    });

    return newMaterial;
  } catch (error) {
    console.error("Error creating study material:", error);
    throw error;
  }
}

// Update an existing study material
export async function updateStudyMaterial(
  materialId: string,
  updateData: Partial<IStudyMaterial>
): Promise<IStudyMaterial | null> {
  try {
    await connectToDatabase();
    
    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
      materialId,
      updateData,
      { new: true }
    );
    
    return updatedMaterial;
  } catch (error) {
    console.error("Error updating study material:", error);
    throw error;
  }
}

// Delete a study material
export async function deleteStudyMaterial(materialId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    const result = await StudyMaterial.findByIdAndDelete(materialId);
    
    return !!result;
  } catch (error) {
    console.error("Error deleting study material:", error);
    throw error;
  }
}

// Get all unique categories
export async function getAllCategories(): Promise<string[]> {
  try {
    await connectToDatabase();
    
    const categories = await StudyMaterial.distinct("category");
    
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
