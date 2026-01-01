import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PokemonImage } from './PokemonImage';
import { QuizOptions } from './QuizOptions';
import { ScoreDisplay } from './ScoreDisplay';
import { usePokemonQuiz } from '@/hooks/usePokemonQuiz';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { PlayerNameInput } from './PlayerNameInput';

export const QuizCard = () => {
  const {
    playerName,
    setPlayerName,
    currentPokemon,
    options,
    score,
    streak,
    bestStreak,
    totalQuestions,
    isLoading,
    hasAnswered,
    selectedAnswer,
    isCorrect,
    loadNewQuestion,
    submitAnswer,
    resetQuiz,
  } = usePokemonQuiz();

  useEffect(() => {
    if (playerName) {
      loadNewQuestion();
    }
    // Only load question if name is set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName]);

  if (!playerName) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <PlayerNameInput onSubmit={setPlayerName} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Score Display */}
      <div className="mb-8">
        <ScoreDisplay
          score={score}
          totalQuestions={totalQuestions}
          streak={streak}
          bestStreak={bestStreak}
          playerName={playerName}
        />
      </div>

      {/* Main Quiz Card */}
      <div className="card-gradient rounded-3xl border border-border p-6 md:p-10 shadow-2xl">
        {/* Question Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
            Who's That Pokémon?
          </h2>
          <p className="text-muted-foreground">
            {(() => {
              if (!hasAnswered) return "Guess the Pokémon from its silhouette!";
              if (isCorrect) return "That's correct! 🎉";
              return `It was ${currentPokemon?.name}!`;
            })()}
          </p>
        </div>

        {/* Pokemon Image */}
        <div className="flex justify-center mb-8">
          {isLoading ? (
            <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
          ) : currentPokemon && (
            <PokemonImage
              src={currentPokemon.sprite}
              name={currentPokemon.name}
              revealed={hasAnswered}
            />
          )}
        </div>

        {/* Answer Options */}
        <div className="flex justify-center mb-8">
          {!isLoading && (
            <QuizOptions
              options={options}
              correctAnswer={currentPokemon?.name || ''}
              selectedAnswer={selectedAnswer}
              hasAnswered={hasAnswered}
              onSelect={submitAnswer}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {hasAnswered && (
            <Button
              onClick={loadNewQuestion}
              size="xl"
              className="glow-primary animate-bounce-in"
            >
              Next Pokémon
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
          
          {totalQuestions > 0 && (
            <Button
              onClick={resetQuiz}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
