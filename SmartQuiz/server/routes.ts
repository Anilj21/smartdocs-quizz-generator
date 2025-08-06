import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuizSchema, quizDataSchema, generateQuizRequestSchema } from "@shared/schema";
import { generateQuizFromText } from "./services/openai";
import { extractTextFromPPTX, validatePPTXFile } from "./services/pptx-parser";
import { extractTextFromDocument, validateDocumentFile, getSupportedFileType } from "./services/document-parser";
import { generateQuizPDF } from "./services/pdf-generator";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // .docx
      'application/pdf'  // .pdf
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pptx, .docx, and .pdf files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate quiz from uploaded document (PPTX, DOCX, or PDF)
  app.post("/api/generate-quiz", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname;

      // Parse question count from request body
      let questionCount = 5; // default
      if (req.body.questionCount) {
        try {
          const parsed = generateQuizRequestSchema.parse({ 
            questionCount: parseInt(req.body.questionCount) 
          });
          questionCount = parsed.questionCount;
        } catch (error) {
          // Use default if parsing fails
          questionCount = 5;
        }
      }

      if (!validateDocumentFile(originalName)) {
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        return res.status(400).json({ message: "Invalid file type. Please upload a .pptx, .docx, or .pdf file" });
      }

      try {
        // Extract text from document
        const documentText = await extractTextFromDocument(filePath, originalName);
        
        if (!documentText || documentText.length < 10) {
          throw new Error("Could not extract sufficient text from the document");
        }

        // Generate quiz using OpenAI with custom question count
        const fileBaseName = path.basename(originalName, path.extname(originalName));
        const generatedQuiz = await generateQuizFromText(documentText, fileBaseName, questionCount);

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json({
          title: path.basename(originalName, path.extname(originalName)),
          sourceFile: originalName,
          questions: generatedQuiz.questions,
          questionCount: generatedQuiz.questions.length
        });
      } catch (error) {
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        throw error;
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate quiz" 
      });
    }
  });

  // Save quiz to database
  app.post("/api/save-quiz", async (req, res) => {
    try {
      const validatedData = insertQuizSchema.parse(req.body);
      
      // Validate questions format
      quizDataSchema.parse({ questions: validatedData.questions });
      
      const savedQuiz = await storage.createQuiz(validatedData);
      res.json(savedQuiz);
    } catch (error) {
      console.error("Error saving quiz:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to save quiz" 
      });
    }
  });

  // Get user's saved quizzes
  app.get("/api/my-quizzes", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const quizzes = await storage.getQuizzesByUserId(userId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get specific quiz
  app.get("/api/quiz/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Download quiz as PDF
  app.post("/api/download-pdf", async (req, res) => {
    try {
      const { title, sourceFile, questions } = req.body;
      
      if (!title || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Invalid quiz data" });
      }

      const pdfBuffer = await generateQuizPDF({
        title,
        sourceFile: sourceFile || 'Unknown',
        questions,
        createdAt: new Date()
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Delete quiz
  app.delete("/api/quiz/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuiz(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
