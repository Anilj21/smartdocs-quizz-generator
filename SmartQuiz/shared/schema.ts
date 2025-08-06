import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  sourceFile: text("source_file").notNull(),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  questionCount: integer("question_count").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.string(),
});

export const quizDataSchema = z.object({
  questions: z.array(quizQuestionSchema),
});

export const generateQuizRequestSchema = z.object({
  questionCount: z.number().min(1).max(20).default(5),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizData = z.infer<typeof quizDataSchema>;
export type GenerateQuizRequest = z.infer<typeof generateQuizRequestSchema>;
