import { Button } from '@/components/ui/button';

interface QuizOptionsProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  hasAnswered: boolean;
  onSelect: (answer: string) => Promise<void> | void;
}

export const QuizOptions = ({
  options,
  correctAnswer,
  selectedAnswer,
  hasAnswered,
  onSelect,
  isLoading,
  gameOver,
}: QuizOptionsProps & { isLoading?: boolean; gameOver?: boolean }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
      {options.map((option, index) => (
        <Button
          key={option}
          variant={getVariant(option)}
          onClick={() => {
            if (!hasAnswered && !isLoading && !gameOver && option) {
              Promise.resolve(onSelect(option)).catch(console.error);
            }
          }}
          disabled={hasAnswered && option !== correctAnswer && option !== selectedAnswer || isLoading || gameOver}
          className="transition-all duration-200 hover:scale-105 h-auto py-4"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-black mr-3 shrink-0">
            {['🅰️', '🅱️', '©️', '🅳'][index] || String.fromCharCode(65 + index)}
          </span>
          <span className="text-lg font-bold">{option}</span>
        </Button>
      ))}
    </div>
  );
};
