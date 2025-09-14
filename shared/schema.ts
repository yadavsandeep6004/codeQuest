import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);
export const questionTypeEnum = pgEnum('question_type', ['mcq', 'coding']);
export const submissionStatusEnum = pgEnum('submission_status', ['pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('student'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: questionTypeEnum("type").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  // For MCQ questions
  options: jsonb("options"), // Array of strings for MCQ options
  correctAnswer: text("correct_answer"), // For MCQ: the correct option, for coding: not used
  // For coding questions
  starterCode: text("starter_code"), // Initial code template
  testCases: jsonb("test_cases"), // Array of {input, expectedOutput}
  topics: jsonb("topics"), // Array of topic tags
  acceptance: integer("acceptance").default(0), // Acceptance percentage
  submissions: integer("submissions").default(0), // Total submissions count
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  questionId: varchar("question_id").notNull().references(() => questions.id),
  code: text("code"), // For coding problems
  answer: text("answer"), // For MCQ problems
  language: text("language"), // Programming language for coding problems
  status: submissionStatusEnum("status").notNull().default('pending'),
  runtime: integer("runtime"), // Runtime in milliseconds
  memory: integer("memory"), // Memory usage in MB
  score: integer("score"), // Score out of 100
  testCasesPassed: integer("test_cases_passed").default(0),
  totalTestCases: integer("total_test_cases").default(0),
  errorMessage: text("error_message"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  submissions: many(submissions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [questions.createdBy],
    references: [users.id],
  }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [submissions.questionId],
    references: [questions.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  acceptance: true,
  submissions: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
