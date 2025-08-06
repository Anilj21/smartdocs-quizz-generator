import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-default"
});

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface GeneratedQuiz {
  questions: QuizQuestion[];
}

export async function generateQuizFromText(slideText: string, title: string = "", questionCount: number = 5): Promise<GeneratedQuiz> {
  try {
    const prompt = `Convert the following PowerPoint slide content into exactly ${questionCount} multiple choice questions (MCQs). Each question should have 4 options (A, B, C, D) and clearly indicate the correct answer.

Slide content:
${slideText}

Requirements:
- Generate exactly ${questionCount} questions
- Each question must have exactly 4 options
- Clearly identify the correct answer for each question
- Questions should test understanding of the key concepts
- Make questions challenging but fair
- Avoid trivial or overly obvious questions
- Distribute questions across different topics/concepts from the content

Respond with JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert quiz generator. Create high-quality multiple choice questions based on the provided content. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Validate each question has required fields
    for (const question of result.questions) {
      if (!question.question || !question.options || !Array.isArray(question.options) || 
          question.options.length !== 4 || !question.answer) {
        throw new Error("Invalid question format from OpenAI");
      }
    }

    return result as GeneratedQuiz;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
