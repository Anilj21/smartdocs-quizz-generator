import { type User, type InsertUser, type Quiz, type InsertQuiz } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getQuiz(id: string): Promise<Quiz | undefined>;
  getQuizzesByUserId(userId: string): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  deleteQuiz(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quizzes: Map<string, Quiz>;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizzesByUserId(userId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.userId === userId
    );
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...insertQuiz,
      id,
      createdAt: new Date(),
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    return this.quizzes.delete(id);
  }
}

export const storage = new MemStorage();
