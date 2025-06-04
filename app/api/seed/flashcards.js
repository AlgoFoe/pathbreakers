import { connectToDatabase } from "../../../lib/database/mongoose";
import Flashcard from "../../../lib/database/models/flashcard.model";

/**
 * Seeds the database with initial flashcards
 */
export const seedFlashcards = async () => {
  try {
    await connectToDatabase();
    
    // Check if we already have flashcards
    const existingCount = await Flashcard.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} flashcards. Skipping seed.`);
      return { success: true, message: `Database already has ${existingCount} flashcards` };
    }
    
    const flashcards = [
      // Physics
      {
        question: "What is Newton's First Law of Motion?",
        answer: "An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
        category: "Physics",
        difficulty: "medium",
      },
      {
        question: "What is the formula for kinetic energy?",
        answer: "KE = (1/2)mv² where m is mass and v is velocity",
        category: "Physics",
        difficulty: "easy",
      },
      {
        question: "What is the SI unit of electric current?",
        answer: "Ampere (A)",
        category: "Physics",
        difficulty: "easy",
      },
      {
        question: "What is the Heisenberg Uncertainty Principle?",
        answer: "It is impossible to simultaneously measure the position and momentum of a particle with perfect precision. The more precisely one quantity is measured, the less precisely the other can be measured.",
        category: "Physics",
        difficulty: "hard",
      },

      // Chemistry
      {
        question: "What is the atomic number of Carbon?",
        answer: "6",
        category: "Chemistry",
        difficulty: "easy",
      },
      {
        question: "What is the pH of a neutral solution?",
        answer: "7",
        category: "Chemistry",
        difficulty: "easy",
      },
      {
        question: "What is the chemical formula for glucose?",
        answer: "C₆H₁₂O₆",
        category: "Chemistry",
        difficulty: "medium",
      },
      {
        question: "What is the Pauli Exclusion Principle?",
        answer: "No two electrons in an atom can have the same set of four quantum numbers.",
        category: "Chemistry",
        difficulty: "hard",
      },

      // Mathematics
      {
        question: "What is the derivative of f(x) = x² with respect to x?",
        answer: "f'(x) = 2x",
        category: "Mathematics",
        difficulty: "medium",
      },
      {
        question: "What is the formula for the area of a circle?",
        answer: "A = πr² where r is the radius",
        category: "Mathematics",
        difficulty: "easy",
      },
      {
        question: "What is the Pythagorean Theorem?",
        answer: "In a right-angled triangle, the square of the length of the hypotenuse is equal to the sum of the squares of the lengths of the other two sides. a² + b² = c²",
        category: "Mathematics",
        difficulty: "medium",
      },
      {
        question: "What is the definition of a prime number?",
        answer: "A natural number greater than 1 that cannot be formed by multiplying two smaller natural numbers.",
        category: "Mathematics",
        difficulty: "easy",
      },

      // Biology
      {
        question: "What is the process by which plants make food?",
        answer: "Photosynthesis",
        category: "Biology",
        difficulty: "easy",
      },
      {
        question: "What are the four nitrogenous bases in DNA?",
        answer: "Adenine (A), Guanine (G), Cytosine (C), and Thymine (T)",
        category: "Biology",
        difficulty: "medium",
      },
      {
        question: "What is the powerhouse of the cell?",
        answer: "Mitochondria",
        category: "Biology",
        difficulty: "easy",
      },
      {
        question: "What is the Central Dogma of Molecular Biology?",
        answer: "The flow of genetic information from DNA to RNA to protein: DNA → RNA → Protein",
        category: "Biology",
        difficulty: "medium",
      },

      // General Knowledge
      {
        question: "What is the capital of India?",
        answer: "New Delhi",
        category: "General Knowledge",
        difficulty: "easy",
      },
      {
        question: "Who wrote 'A Brief History of Time'?",
        answer: "Stephen Hawking",
        category: "General Knowledge",
        difficulty: "medium",
      },
      {
        question: "In which year did India gain independence from British rule?",
        answer: "1947",
        category: "General Knowledge",
        difficulty: "easy",
      },
      {
        question: "Who is credited with inventing the World Wide Web?",
        answer: "Tim Berners-Lee",
        category: "General Knowledge",
        difficulty: "medium",
      },
    ];
    
    await Flashcard.insertMany(flashcards);
    
    console.log(`Successfully seeded ${flashcards.length} flashcards`);
    return { success: true, message: `Successfully seeded ${flashcards.length} flashcards` };
  } catch (error) {
    console.error("Error seeding flashcards:", error);
    return { success: false, message: "Failed to seed flashcards" };
  }
};
