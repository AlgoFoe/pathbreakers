'use server'

import { seedStudyMaterials } from "@/app/api/seed/study-materials.js";

export async function seedMaterials() {
  return await seedStudyMaterials();
}
