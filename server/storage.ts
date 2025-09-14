import { 
  users, 
  questions, 
  submissions,
  type User, 
  type InsertUser,
  type Question,
  type InsertQuestion,
  type Submission,
  type InsertSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Question operations
  getQuestions(filters?: { type?: string; difficulty?: string; search?: string }): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  
  // Submission operations
  getSubmissions(userId?: string, questionId?: string): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, submission: Partial<InsertSubmission>): Promise<Submission>;
  
  // Analytics
  getUserStats(userId: string): Promise<{
    totalSubmissions: number;
    acceptedSubmissions: number;
    successRate: number;
    averageRuntime: number;
    currentStreak: number;
  }>;
  
  getAdminStats(): Promise<{
    activeStudents: number;
    totalQuestions: number;
    dailySubmissions: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getQuestions(filters?: { type?: string; difficulty?: string; search?: string }): Promise<Question[]> {
    let query = db.select().from(questions);
    
    if (filters?.type) {
      query = query.where(eq(questions.type, filters.type as any));
    }
    
    if (filters?.difficulty) {
      query = query.where(eq(questions.difficulty, filters.difficulty as any));
    }
    
    if (filters?.search) {
      query = query.where(sql`${questions.title} ILIKE ${`%${filters.search}%`}`);
    }
    
    return await query.orderBy(questions.createdAt);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db
      .insert(questions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question> {
    const [updatedQuestion] = await db
      .update(questions)
      .set(question)
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteQuestion(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  async getSubmissions(userId?: string, questionId?: string): Promise<Submission[]> {
    let query = db.select().from(submissions);
    
    if (userId && questionId) {
      query = query.where(and(eq(submissions.userId, userId), eq(submissions.questionId, questionId)));
    } else if (userId) {
      query = query.where(eq(submissions.userId, userId));
    } else if (questionId) {
      query = query.where(eq(submissions.questionId, questionId));
    }
    
    return await query.orderBy(desc(submissions.submittedAt));
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db
      .insert(submissions)
      .values(submission)
      .returning();
    
    // Update question statistics
    await db
      .update(questions)
      .set({
        submissions: sql`${questions.submissions} + 1`,
        acceptance: sql`CASE 
          WHEN ${newSubmission.status} = 'accepted' 
          THEN ROUND((
            SELECT COUNT(*)::float / ${questions.submissions} * 100
            FROM ${submissions} 
            WHERE ${submissions.questionId} = ${newSubmission.questionId} 
            AND ${submissions.status} = 'accepted'
          ))
          ELSE ${questions.acceptance}
        END`
      })
      .where(eq(questions.id, newSubmission.questionId));
    
    return newSubmission;
  }

  async updateSubmission(id: string, submission: Partial<InsertSubmission>): Promise<Submission> {
    const [updatedSubmission] = await db
      .update(submissions)
      .set(submission)
      .where(eq(submissions.id, id))
      .returning();
    return updatedSubmission;
  }

  async getUserStats(userId: string): Promise<{
    totalSubmissions: number;
    acceptedSubmissions: number;
    successRate: number;
    averageRuntime: number;
    currentStreak: number;
  }> {
    const stats = await db
      .select({
        totalSubmissions: count(),
        acceptedSubmissions: sql<number>`COUNT(CASE WHEN ${submissions.status} = 'accepted' THEN 1 END)`,
        averageRuntime: sql<number>`AVG(${submissions.runtime})`
      })
      .from(submissions)
      .where(eq(submissions.userId, userId));

    const totalSubmissions = stats[0]?.totalSubmissions || 0;
    const acceptedSubmissions = stats[0]?.acceptedSubmissions || 0;
    const successRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
    const averageRuntime = stats[0]?.averageRuntime || 0;

    return {
      totalSubmissions,
      acceptedSubmissions,
      successRate,
      averageRuntime,
      currentStreak: 7 // TODO: Implement streak calculation
    };
  }

  async getAdminStats(): Promise<{
    activeStudents: number;
    totalQuestions: number;
    dailySubmissions: number;
    successRate: number;
  }> {
    const [userCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'student'));

    const [questionCount] = await db
      .select({ count: count() })
      .from(questions);

    const [dailySubmissions] = await db
      .select({ count: count() })
      .from(submissions)
      .where(sql`DATE(${submissions.submittedAt}) = CURRENT_DATE`);

    const [successStats] = await db
      .select({
        total: count(),
        accepted: sql<number>`COUNT(CASE WHEN ${submissions.status} = 'accepted' THEN 1 END)`
      })
      .from(submissions);

    const successRate = successStats?.total > 0 ? (successStats.accepted / successStats.total) * 100 : 0;

    return {
      activeStudents: userCount?.count || 0,
      totalQuestions: questionCount?.count || 0,
      dailySubmissions: dailySubmissions?.count || 0,
      successRate
    };
  }
}

export const storage = new DatabaseStorage();
