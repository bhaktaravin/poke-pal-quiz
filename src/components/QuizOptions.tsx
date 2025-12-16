import { Button } from '@/components/ui/button';

interface QuizOptionsProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  hasAnswered: boolean;
  onSelect: (answer: string) => void;
}

export const QuizOptions = ({
  options,
  correctAnswer,
  selectedAnswer,
  hasAnswered,
  onSelect,
}: QuizOptionsProps) => {
  const getVariant = (option: string) => {
    if (!hasAnswered) {
      return selectedAnswer === option ? 'quizSelected' : 'quiz';
    }
    
    if (option === correctAnswer) {
      return 'quizCorrect';
    }
    
    if (option === selectedAnswer && option !== correctAnswer) {
      return 'quizWrong';
    }
    
    return 'quiz';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
      {options.map((option, index) => (
        <Button
          key={option}
          variant={getVariant(option)}
          onClick={() => !hasAnswered && onSelect(option)}
          disabled={hasAnswered && option !== correctAnswer && option !== selectedAnswer}
          className="transition-all duration-200"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold mr-3 shrink-0">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="text-base font-semibold">{option}</span>
        </Button>
      ))}
    </div>
  );
};
