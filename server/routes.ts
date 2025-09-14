import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertQuestionSchema, insertSubmissionSchema, type User } from "@shared/schema";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const JWT_SECRET = process.env.SESSION_SECRET || "fallback_secret";

// Middleware to verify JWT token
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin role
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Add default role if not provided
      const userDataWithDefaults = {
        ...req.body,
        role: req.body.role || 'student'
      };
      
      const userData = insertUserSchema.parse(userDataWithDefaults);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  // Questions routes
  app.get("/api/questions", authenticateToken, async (req, res) => {
    try {
      const { type, difficulty, search } = req.query;
      const questions = await storage.getQuestions({
        type: type as string,
        difficulty: difficulty as string,
        search: search as string,
      });
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get("/api/questions/:id", authenticateToken, async (req, res) => {
    try {
      const question = await storage.getQuestion(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  app.post("/api/questions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ message: "Invalid question data" });
    }
  });

  app.put("/api/questions/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(req.params.id, questionData);
      res.json(question);
    } catch (error) {
      res.status(400).json({ message: "Failed to update question" });
    }
  });

  app.delete("/api/questions/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteQuestion(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete question" });
    }
  });

  // Submissions routes
  app.get("/api/submissions", authenticateToken, async (req, res) => {
    try {
      const { questionId } = req.query;
      const submissions = await storage.getSubmissions(
        req.user!.id,
        questionId as string
      );
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/submissions", authenticateToken, async (req, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ message: "Invalid submission data" });
    }
  });

  // Code execution route
  app.post("/api/execute", authenticateToken, async (req, res) => {
    try {
      const { code, language, testCases } = req.body;
      
      // Simulate Judge0 API call
      const results = testCases.map((testCase: any, index: number) => ({
        testCase: index + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: testCase.expectedOutput, // Mock: assume all pass
        status: "accepted",
        runtime: Math.floor(Math.random() * 100) + 50,
        memory: Math.floor(Math.random() * 10) + 40
      }));

      const allPassed = results.every((r: any) => r.status === "accepted");
      const avgRuntime = Math.floor(results.reduce((sum: number, r: any) => sum + r.runtime, 0) / results.length);
      const avgMemory = Math.floor(results.reduce((sum: number, r: any) => sum + r.memory, 0) / results.length);

      res.json({
        status: allPassed ? "accepted" : "wrong_answer",
        runtime: avgRuntime,
        memory: avgMemory,
        testResults: results,
        passedTests: results.filter((r: any) => r.status === "accepted").length,
        totalTests: results.length
      });
    } catch (error) {
      res.status(500).json({ message: "Code execution failed" });
    }
  });

  // Stats routes
  app.get("/api/stats/user", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/stats/admin", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
