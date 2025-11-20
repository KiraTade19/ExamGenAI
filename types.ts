export enum QuestionType {
  MultipleChoice = 'Multiple Choice',
  TrueFalse = 'True/False',
  ShortAnswer = 'Short Answer',
  Matching = 'Matching',
  ProblemSolving = 'Problem Solving/Coding',
}

export interface ExamQuestion {
  id: number;
  type: QuestionType;
  questionText: string;
  options?: string[]; // For MCQ
  codeSnippet?: string; // For code analysis questions
  correctAnswer: string;
  explanation: string;
}

export interface ExamData {
  title: string;
  description: string;
  questions: ExamQuestion[];
}

export interface GenerationConfig {
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed';
  questionCount: number;
  content: string; // The user uploaded content or pasted text
}

export enum AppState {
  Input = 'INPUT',
  Loading = 'LOADING',
  Results = 'RESULTS',
  Error = 'ERROR',
}