import React, { useState, useCallback } from 'react';
import { AppState, ExamData, GenerationConfig } from './types';
import { generateExam } from './services/geminiService';
import { Spinner } from './components/Spinner';
import { QuestionCard } from './components/QuestionCard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Input);
  const [config, setConfig] = useState<GenerationConfig>({
    topic: '',
    difficulty: 'Intermediate',
    questionCount: 10, // Default lower to be safe, user can increase
    content: '',
  });
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setConfig((prev) => ({ ...prev, content: text }));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.content.trim() && !config.topic.trim()) {
      setError("Please provide either a topic or upload study material.");
      return;
    }

    setAppState(AppState.Loading);
    setError(null);

    try {
      const data = await generateExam(config);
      setExamData(data);
      setAppState(AppState.Results);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setAppState(AppState.Error);
    }
  };

  const resetApp = () => {
    setAppState(AppState.Input);
    setExamData(null);
    setError(null);
    setConfig(prev => ({...prev, content: ''}));
  };

  const downloadExam = () => {
    if (!examData) return;
    const textContent = `EXAM: ${examData.title}\n\n${examData.description}\n\n` + 
      examData.questions.map((q, i) => 
        `Q${i+1} [${q.type}]: ${q.questionText}\n` +
        (q.options ? `Options: ${q.options.join(', ')}\n` : '') +
        `Answer: ${q.correctAnswer}\n` +
        `Explanation: ${q.explanation}\n`
      ).join('\n---\n\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cs-exam-generated.txt';
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-white font-bold font-mono text-xl">CS</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              Exam<span className="text-brand-400">GenAI</span>
            </h1>
          </div>
          {appState === AppState.Results && (
            <button 
              onClick={resetApp}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Create New
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        
        {/* INPUT STATE */}
        {appState === AppState.Input && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Master any <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">CS Topic</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Upload your lecture notes, code, or simply a topic name. Our AI will construct a comprehensive exam to test your knowledge.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl">
              
              {/* Topic & Count Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject / Topic Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Distributed Systems, React Hooks, O(n) complexity"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    value={config.topic}
                    onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Questions
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      value={config.questionCount}
                      onChange={(e) => setConfig({ ...config, questionCount: Number(e.target.value) })}
                    >
                      <option value={5}>5 (Quick)</option>
                      <option value={10}>10 (Standard)</option>
                      <option value={20}>20 (Detailed)</option>
                      <option value={30}>30 (Full Exam)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      value={config.difficulty}
                      onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Content Upload/Paste */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Study Material (Paste text or upload file)
                </label>
                <div className="relative">
                  <textarea
                    className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                    placeholder="// Paste code, notes, or theory here..."
                    value={config.content}
                    onChange={(e) => setConfig({ ...config, content: e.target.value })}
                  ></textarea>
                  <div className="absolute bottom-3 right-3">
                     <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".txt,.md,.json,.js,.ts,.py,.java,.cpp,.c,.h,.cs,.html,.css"
                        onChange={handleFileUpload}
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Upload File
                      </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/25 transform transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                Generate Exam
              </button>
            </form>
          </div>
        )}

        {/* LOADING STATE */}
        {appState === AppState.Loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Spinner />
            <p className="mt-8 text-slate-500 text-sm max-w-md text-center">
              Generating {config.questionCount} {config.difficulty.toLowerCase()} questions covering {config.topic || 'your material'}...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {appState === AppState.Error && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
             <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
             <p className="text-red-300 mb-6">{error}</p>
             <button 
              onClick={() => setAppState(AppState.Input)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
             >
               Try Again
             </button>
          </div>
        )}

        {/* RESULTS STATE */}
        {appState === AppState.Results && examData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{examData.title}</h2>
                <p className="text-slate-400 max-w-2xl">{examData.description}</p>
              </div>
              <button 
                onClick={downloadExam}
                className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM8 4a1 1 0 011-1h2a1 1 0 011 1v8.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L8 12.586V4z" clipRule="evenodd" />
                </svg>
                Download Exam
              </button>
            </div>

            <div className="space-y-6">
              {examData.questions.map((q, i) => (
                <QuestionCard key={q.id || i} question={q} index={i} />
              ))}
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Exam Completed?</h3>
              <p className="text-slate-400 mb-6">Ready to tackle another subject or increase the difficulty?</p>
              <button
                onClick={resetApp}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-colors"
              >
                Generate New Exam
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Powered by Google Gemini 2.5 Flash. Built for Computer Science Students & Professionals.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;