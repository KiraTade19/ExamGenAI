import React, { useState } from 'react';
import { ExamQuestion, QuestionType } from '../types';

interface QuestionCardProps {
  question: ExamQuestion;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const getTypeColor = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MultipleChoice: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case QuestionType.TrueFalse: return 'bg-green-500/20 text-green-300 border-green-500/30';
      case QuestionType.ProblemSolving: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case QuestionType.Matching: return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg transition-all hover:border-brand-500/50">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300 font-mono font-bold border border-slate-600">
            {index + 1}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(question.type)}`}>
            {question.type}
          </span>
        </div>
      </div>

      {/* Question Body */}
      <div className="mb-6">
        <p className="text-lg text-slate-100 font-medium leading-relaxed">
          {question.questionText}
        </p>
        
        {question.codeSnippet && (
          <div className="mt-4 bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
            <pre className="text-sm font-mono text-brand-200">
              <code>{question.codeSnippet}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Options (if MCQ) */}
      {question.type === QuestionType.MultipleChoice && question.options && (
        <div className="grid grid-cols-1 gap-2 mb-6">
          {question.options.map((opt, idx) => (
            <div key={idx} className="flex items-center p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
              <div className="w-6 h-6 rounded-full border border-slate-600 mr-3 flex-shrink-0 flex items-center justify-center text-xs text-slate-500 font-mono">
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="text-slate-300">{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Answer Section */}
      <div className="border-t border-slate-700/50 pt-4">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-sm text-brand-400 hover:text-brand-300 font-medium flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Reveal Answer
          </button>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-2 mb-2">
              <span className="text-green-400 font-bold shrink-0">Answer:</span>
              <span className="text-slate-200">{question.correctAnswer}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg text-sm text-slate-400 border-l-2 border-brand-500">
              <span className="font-semibold text-brand-400 block mb-1">Explanation:</span>
              {question.explanation}
            </div>
            <button 
              onClick={() => setShowAnswer(false)}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300"
            >
              Hide Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};