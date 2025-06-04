// Sample quizzes to seed the database
import { Schema } from "mongoose";

// Define the quiz data structure matching our MongoDB schema
function generateDummyQuestions(count) {
  const dummy = [];
  for (let i = 1; i <= count; i++) {
    dummy.push({
      id: i,
      question: `Dummy question ${i}?`,
      options: [
        { id: "A", text: "Option A", formula: "Option A" },
        { id: "B", text: "Option B", formula: "Option B" },
        { id: "C", text: "Option C", formula: "Option C" },
        { id: "D", text: "Option D", formula: "Option D" }
      ],
      correctAnswer: "A"
    });
  }
  return dummy;
}

export const quizzes = [
  {
    id: "monthly-may-2025",
    title: "Monthly Test - May 2025",
    date: new Date("2025-05-23T10:00:00Z"),
    duration: 120,
    questionsCount: 100,
    syllabus: [
      "Organic Chemistry",
      "Physical Chemistry",
      "Inorganic Chemistry",
      "Mathematics",
      "Physics"
    ],
    status: "live",
    questions: generateDummyQuestions(100)
  },
  {
    id: "weekly-june-2025",
    title: "Weekly Test - June 2025",
    date: new Date("2025-05-25T09:00:00Z"),
    duration: 60,
    questionsCount: 5,
    status: "upcoming",
    syllabus: [
      "Alcohols, Phenols and Ethers",
      "Polymers",
      "Surface Chemistry",
      "Solid State",
      "Chemical Kinetics"
    ],
    questions: [
      {
        id: 1,
        question: "Which of the following has the highest boiling point?",
        options: [
          { id: "A", text: "Methanol", formula: "Methanol" },
          { id: "B", text: "Ethanol", formula: "Ethanol" },
          { id: "C", text: "Propanol", formula: "Propanol" },
          { id: "D", text: "Butanol", formula: "Butanol" }
        ],
        correctAnswer: "D"
      },
      {
        id: 2,
        question: "The polymer used in the manufacture of parachutes is",
        options: [
          { id: "A", text: "Nylon-6", formula: "Nylon-6" },
          { id: "B", text: "Nylon-6,6", formula: "Nylon-6,6" },
          { id: "C", text: "Nylon-6,10", formula: "Nylon-6,10" },
          { id: "D", text: "Nylon-6,12", formula: "Nylon-6,12" }
        ],
        correctAnswer: "B"
      },
      {
        id: 3,
        question: "Which of the following is an example of a solid aerosol?",
        options: [
          { id: "A", text: "Fog", formula: "Fog" },
          { id: "B", text: "Smoke", formula: "Smoke" },
          { id: "C", text: "Cloud", formula: "Cloud" },
          { id: "D", text: "Dust storm", formula: "Dust storm" }
        ],
        correctAnswer: "B"
      },
      {
        id: 4,
        question: "The coordination number of each ion in a rock salt structure is",
        options: [
          { id: "A", text: "4", formula: "4" },
          { id: "B", text: "6", formula: "6" },
          { id: "C", text: "8", formula: "8" },
          { id: "D", text: "12", formula: "12" }
        ],
        correctAnswer: "B"
      },
      {
        id: 5,
        question: "The rate constant of a reaction doubles when the temperature changes from 27°C to 37°C. The activation energy of the reaction is",
        options: [
          { id: "A", text: "52.86 kJ/mol", formula: "52.86 kJ/mol" },
          { id: "B", text: "5.286 kJ/mol", formula: "5.286 kJ/mol" },
          { id: "C", text: "0.5286 kJ/mol", formula: "0.5286 kJ/mol" },
          { id: "D", text: "528.6 kJ/mol", formula: "528.6 kJ/mol" }
        ],
        correctAnswer: "A"
      }
    ]
  },
  {
    id: "weekly-may-2025",
    title: "Weekly Test - May 2025",
    date: new Date("2025-05-20T09:00:00Z"),
    duration: 60,
    questionsCount: 3,
    syllabus: [
      "Chemical Bonding",
      "Coordination Compounds",
      "Biomolecules"
    ],
    status: "archived",
    questions: [
      {
        id: 1,
        question: "Which of the following molecules has a linear shape?",
        options: [
          { id: "A", text: "H₂O", formula: "H₂O" },
          { id: "B", text: "CO₂", formula: "CO₂" },
          { id: "C", text: "NH₃", formula: "NH₃" },
          { id: "D", text: "CH₄", formula: "CH₄" }
        ],
        correctAnswer: "B"
      },
      {
        id: 2,
        question: "The IUPAC name of [Pt(NH₃)₂Cl₂] is",
        options: [
          { id: "A", text: "Diamminedichloridoplatinum(II)", formula: "Diamminedichloridoplatinum(II)" },
          { id: "B", text: "Diamminedichloroplatinum(II)", formula: "Diamminedichloroplatinum(II)" },
          { id: "C", text: "Diamminedichloroplatinum(IV)", formula: "Diamminedichloroplatinum(IV)" },
          { id: "D", text: "Dichloridodiammineplatinum(II)", formula: "Dichloridodiammineplatinum(II)" }
        ],
        correctAnswer: "B"
      },
      {
        id: 3,
        question: "Which of the following is not a reducing sugar?",
        options: [
          { id: "A", text: "Glucose", formula: "Glucose" },
          { id: "B", text: "Maltose", formula: "Maltose" },
          { id: "C", text: "Sucrose", formula: "Sucrose" },
          { id: "D", text: "Lactose", formula: "Lactose" }
        ],
        correctAnswer: "C"
      }
    ]
  }
];
