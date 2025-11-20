import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExamData, GenerationConfig, QuestionType } from "../types";

// Helper to sanitize the response if needed, though JSON schema handles most.
const cleanText = (text: string) => text.trim();

export const generateExam = async (config: GenerationConfig): Promise<ExamData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are a world-class Computer Science Professor and Exam Creator.
Your goal is to generate specialized exam questions based strictly on the provided material or topic.

Rules:
1. Read and understand the material in detail (theory, math, algos, architecture, code, terminology).
2. Handle any CS domain (Programming, DSA, OS, Networks, DB, AI/ML, etc.).
3. Create exactly ${config.questionCount} questions.
4. Difficulty level: ${config.difficulty}.
5. Include these types: True/False, Multiple Choice, Matching, Short Answer, Problem-solving (coding/math/logic).
6. Questions must be original, not copied word-for-word.
7. Cover subtle details.

Output format must be strict JSON matching the provided schema.
  `;

  // Define the schema for the structured output
  const examSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A creative title for the exam based on the content." },
      description: { type: Type.STRING, description: "A brief summary of what this exam covers." },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            type: { 
              type: Type.STRING, 
              enum: [
                QuestionType.MultipleChoice,
                QuestionType.TrueFalse,
                QuestionType.ShortAnswer,
                QuestionType.Matching,
                QuestionType.ProblemSolving
              ]
            },
            questionText: { type: Type.STRING, description: "The main question text." },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Array of options for Multiple Choice. Null or empty for others." 
            },
            codeSnippet: { 
              type: Type.STRING, 
              description: "Optional code block relevant to the question (e.g. 'What does this print?')." 
            },
            correctAnswer: { type: Type.STRING, description: "The direct correct answer." },
            explanation: { type: Type.STRING, description: "Detailed explanation of why the answer is correct." },
          },
          required: ["id", "type", "questionText", "correctAnswer", "explanation"],
        },
      },
    },
    required: ["title", "description", "questions"],
  };

  const prompt = `
    Subject/Topic: ${config.topic || "General Computer Science"}
    
    Study Material Content:
    ${config.content}

    Generate the exam now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: examSchema,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster JSON gen, flash is good enough
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data received from API");

    const examData = JSON.parse(jsonText) as ExamData;
    return examData;

  } catch (error) {
    console.error("GenAI Error:", error);
    throw new Error("Failed to generate exam. Please try again with less content or fewer questions.");
  }
};