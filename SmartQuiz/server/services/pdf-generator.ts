import PDFDocument from 'pdfkit';
import { QuizQuestion } from '@shared/schema';

export interface PDFQuizData {
  title: string;
  sourceFile: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

export function generateQuizPDF(quizData: PDFQuizData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('Quiz: ' + quizData.title, { align: 'center' });

      doc.moveDown(0.5);
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Source: ${quizData.sourceFile}`, { align: 'center' })
         .text(`Generated: ${quizData.createdAt.toLocaleDateString()}`, { align: 'center' });

      doc.moveDown(1);

      // Instructions
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Instructions:');
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('• Choose the best answer for each question')
         .text('• Only one answer is correct per question')
         .text('• Mark your answers clearly');

      doc.moveDown(1);

      // Questions
      quizData.questions.forEach((question, index) => {
        // Check if we need a new page
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`${index + 1}. ${question.question}`, { continued: false });

        doc.moveDown(0.5);

        question.options.forEach((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex); // A, B, C, D
          doc.fontSize(12)
             .font('Helvetica')
             .text(`   ${letter}. ${option}`);
        });

        doc.moveDown(1);
      });

      // Answer Key (on new page)
      doc.addPage();
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('Answer Key', { align: 'center' });

      doc.moveDown(1);

      quizData.questions.forEach((question, index) => {
        const answerIndex = question.options.findIndex(option => option === question.answer);
        const answerLetter = String.fromCharCode(65 + answerIndex);
        
        doc.fontSize(12)
           .font('Helvetica')
           .text(`${index + 1}. ${answerLetter} - ${question.answer}`);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
