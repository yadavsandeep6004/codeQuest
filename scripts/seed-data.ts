import "dotenv/config";
import { db } from "../server/db";
import { questions } from "../shared/schema";

const sampleQuestions = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    type: "coding" as const,
    difficulty: "easy" as const,
    starterCode: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
    return [];
}`,
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { input: "[3,3], 6", expectedOutput: "[0,1]" }
    ],
    topics: ["Array", "Hash Table"],
    createdBy: null
  },
  {
    title: "Palindrome Number",
    description: "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
    type: "coding" as const,
    difficulty: "easy" as const,
    starterCode: `function isPalindrome(x: number): boolean {
    // Your code here
    return false;
}`,
    testCases: [
      { input: "121", expectedOutput: "true" },
      { input: "-121", expectedOutput: "false" },
      { input: "10", expectedOutput: "false" }
    ],
    topics: ["Math"],
    createdBy: null
  },
  {
    title: "Add Two Numbers",
    description: "You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.",
    type: "coding" as const,
    difficulty: "medium" as const,
    starterCode: `class ListNode {
    val: number
    next: ListNode | null
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val===undefined ? 0 : val)
        this.next = (next===undefined ? null : next)
    }
}

function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    // Your code here
    return null;
}`,
    testCases: [
      { input: "[2,4,3], [5,6,4]", expectedOutput: "[7,0,8]" },
      { input: "[0], [0]", expectedOutput: "[0]" },
      { input: "[9,9,9,9,9,9,9], [9,9,9,9]", expectedOutput: "[8,9,9,9,0,0,0,1]" }
    ],
    topics: ["Linked List", "Math", "Recursion"],
    createdBy: null
  },
  {
    title: "JavaScript Basics",
    description: "What is the output of console.log(typeof null)?",
    type: "mcq" as const,
    difficulty: "easy" as const,
    options: ["null", "undefined", "object", "boolean"],
    correctAnswer: "object",
    topics: ["JavaScript"],
    createdBy: null
  },
  {
    title: "Array Methods",
    description: "Which array method creates a new array with all elements that pass a test implemented by the provided function?",
    type: "mcq" as const,
    difficulty: "medium" as const,
    options: ["map()", "filter()", "reduce()", "forEach()"],
    correctAnswer: "filter()",
    topics: ["JavaScript", "Arrays"],
    createdBy: null
  }
];

async function seedData() {
  try {
    console.log("Seeding sample questions...");
    
    for (const question of sampleQuestions) {
      await db.insert(questions).values(question);
      console.log(`✓ Added: ${question.title}`);
    }
    
    console.log("✅ Sample data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();