
import React, { useState, useEffect } from 'react';
import { QuizData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CloseIcon from './icons/CloseIcon';

interface InteractiveActivityModalProps {
  isOpen: boolean;
  isLoading: boolean; // For loading activity content
  activityType: 'quiz' | string;
  activityTopic: string; // For display, e.g. "Quiz on Pillars of Islam"
  activityContent: QuizData | null; // Specifically QuizData for now
  onComplete: (score: number, maxScore: number, activityData: QuizData, selectedAnswers: Record<number, number | null>) => void;
  onCancel: () => void;
  preferredLanguageCode: string; // To potentially pass to activity UI elements
  error: string | null;
}

const InteractiveActivityModal: React.FC<InteractiveActivityModalProps> = ({
  isOpen,
  isLoading,
  activityType,
  activityTopic,
  activityContent,
  onComplete,
  onCancel,
  preferredLanguageCode,
  error
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Reset state when modal is opened for a new activity
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizFinished(false);
      setScore(0);
    }
  }, [isOpen, activityContent]);

  if (!isOpen) return null;

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (activityContent && currentQuestionIndex < activityContent.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!activityContent) return;
    let currentScore = 0;
    activityContent.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswerIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setQuizFinished(true);
    // onComplete will be called after viewing results
  };
  
  const handleCompleteAndClose = () => {
    if(activityContent) {
        // Pass selectedAnswers to onComplete
        onComplete(score, activityContent.questions.length, activityContent, selectedAnswers);
    } else {
        onCancel(); // Should not happen if quizFinished is true
    }
  }


  const renderQuizContent = () => {
    if (!activityContent) return <p className="text-theme-secondary">No quiz content loaded.</p>;
    
    const { title, questions } = activityContent;
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    if (quizFinished) {
      return (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-theme-primary mb-3">Quiz Completed!</h3>
          <p className="text-lg text-theme-secondary mb-1">Title: {title}</p>
          <p className="text-2xl font-bold mb-4" style={{color: score > totalQuestions / 2 ? 'var(--accent-primary)' : 'inherit'}}>
            Your Score: {score} / {totalQuestions}
          </p>
          <button
            onClick={handleCompleteAndClose}
            className="w-full py-2.5 px-4 rounded-md text-sm font-medium btn-accent"
          >
            Close & Claim Achievement
          </button>
        </div>
      );
    }

    return (
      <>
        <h3 className="text-xl font-semibold text-theme-primary mb-1">{title}</h3>
        <p className="text-sm text-theme-secondary mb-4">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
        
        <div className="mb-6 p-4 rounded-md bg-slate-100/50 dark:bg-slate-700/50">
           {currentQuestion.image_url && (
            <img 
              src={currentQuestion.image_url} 
              alt={`Question illustration for ${currentQuestion.text.substring(0,30)}...`} 
              className="max-h-48 w-auto mx-auto rounded-md mb-3 shadow-sm object-contain" 
            />
           )}
           <p className="text-md font-medium text-theme-primary">{currentQuestion.text}</p>
        </div>

        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(currentQuestionIndex, index)}
              className={`w-full text-left p-3 rounded-md border transition-colors duration-150 flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3
                ${selectedAnswers[currentQuestionIndex] === index
                  ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300 dark:bg-blue-600 dark:border-blue-700'
                  : 'bg-white/80 hover:bg-gray-100/80 border-gray-300/70 dark:bg-slate-600/70 dark:hover:bg-slate-500/70 dark:border-slate-500/70 text-theme-primary'
                }`}
              style={selectedAnswers[currentQuestionIndex] === index ? {backgroundColor: 'var(--accent-primary)', color: 'var(--button-text-primary)'} : {}}
            >
              {option.image_url && (
                <img 
                  src={option.image_url} 
                  alt={`Option illustration for ${option.text.substring(0,20)}...`} 
                  className="w-full sm:w-24 h-24 sm:h-auto object-cover rounded-md mb-2 sm:mb-0 shadow-sm flex-shrink-0" 
                />
              )}
              <span className="flex-grow py-1 sm:py-0">{option.text}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="py-2 px-4 rounded-md text-sm font-medium border border-gray-300/50 dark:border-slate-600/50 text-theme-primary hover:bg-gray-100/50 dark:hover:bg-slate-700/50 disabled:opacity-50"
          >
            Previous
          </button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="py-2 px-4 rounded-md text-sm font-medium btn-accent"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              className="py-2 px-4 rounded-md text-sm font-medium bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
            >
              Finish Quiz
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 dark:bg-opacity-80 animate-fadeIn"
        aria-labelledby="activity-modal-title"
        role="dialog"
        aria-modal="true"
    >
      <div className="bg-transparent rounded-lg shadow-2xl w-full max-w-lg transform transition-all animate-slideUp">
        <div className="p-6 space-y-4 glass-primary rounded-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <h2 id="activity-modal-title" className="text-2xl font-semibold text-theme-primary">
                    {activityContent?.title || activityTopic || 'Interactive Activity'}
                </h2>
                <button
                    onClick={onCancel}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100/50
                               dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
                    aria-label="Close activity modal"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>

            {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
                <LoadingSpinner />
                <p className="mt-3 text-theme-secondary">Loading activity...</p>
            </div>
            )}
            {!isLoading && error && (
                 <div className="py-10 text-center">
                    <p className="text-red-500 dark:text-red-400">Error: {error}</p>
                    <button onClick={onCancel} className="mt-4 py-2 px-4 rounded-md text-sm font-medium btn-accent">Close</button>
                </div>
            )}
            {!isLoading && !error && activityType === 'quiz' && activityContent && renderQuizContent()}
            {!isLoading && !error && activityType !== 'quiz' && (
                <p className="text-theme-secondary py-10 text-center">This activity type is not yet supported.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveActivityModal;
