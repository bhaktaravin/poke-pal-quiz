import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PokemonImage } from './PokemonImage';
import { QuizOptions } from './QuizOptions';
import { ScoreDisplay } from './ScoreDisplay';
import { usePokemonQuiz } from '@/hooks/usePokemonQuiz';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { PlayerNameInput } from './PlayerNameInput';

import { PlayerModeSelect } from './PlayerModeSelect';

export const QuizCard = () => {
  const [mode, setModeState] = useState<'1p' | '2p' | null>(null);
  const [player2Name, setPlayer2Name] = useState('');

  // Helper to reset player name and localStorage when mode changes
  const setMode = (newMode: '1p' | '2p') => {
    setModeState(newMode);
    // Clear player name in state and localStorage
    setPlayerName('');
    setPlayer2Name('');
    localStorage.removeItem('poke-pal-quiz:player');
  };
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
    gameOver,
  } = usePokemonQuiz();


  // Only load the first question after name(s) is set and not after every render
  const [quizStarted, setQuizStarted] = useState(false);
  useEffect(() => {
    if (!quizStarted && playerName && (mode === '1p' || (mode === '2p' && player2Name))) {
      loadNewQuestion();
      setQuizStarted(true);
    }
  }, [quizStarted, playerName, player2Name, mode, loadNewQuestion]);

  // Reset quizStarted on reset
  const handleResetQuiz = useCallback(() => {
    setQuizStarted(false);
    resetQuiz();
  }, [resetQuiz]);

  if (!mode) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <PlayerModeSelect mode={mode} setMode={setMode} />
      </div>
    );
  }


  if (mode === '2p' && (!playerName || !player2Name)) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        {!playerName && <PlayerNameInput key="p1" onSubmit={name => { setPlayerName(name); setQuizStarted(false); }} />}
        {playerName && !player2Name && <PlayerNameInput key="p2" onSubmit={name => { setPlayer2Name(name); setQuizStarted(false); }} />}
      </div>
    );
  }

  if (mode === '1p' && !playerName) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <PlayerNameInput key={Date.now()} onSubmit={name => { setPlayerName(name); setQuizStarted(false); }} />
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <ScoreDisplay
            score={score}
            totalQuestions={totalQuestions}
            streak={streak}
            bestStreak={bestStreak}
            playerName={playerName}
          />
        </div>
        <div className="card-gradient rounded-3xl border border-border p-6 md:p-10 shadow-2xl flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-accent mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Wrong! It was {currentPokemon?.name}!</p>
          <Button onClick={resetQuiz} size="xl" className="glow-primary">Play Again</Button>
        </div>
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
          <p className={`text-muted-foreground ${hasAnswered && !isCorrect ? 'text-accent font-bold text-xl' : ''}`}>
            {(() => {
              if (!hasAnswered) return "Guess the Pokémon from its silhouette!";
              if (isCorrect) return "That's correct! 🎉";
              return `Wrong! It was ${currentPokemon?.name}!`;
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
          {quizStarted && currentPokemon && options.length === 4 && !isLoading && !gameOver && !hasAnswered && (
            <QuizOptions
              options={options}
              correctAnswer={currentPokemon.name}
              selectedAnswer={selectedAnswer}
              hasAnswered={hasAnswered}
              onSelect={submitAnswer}
              isLoading={isLoading}
              gameOver={gameOver}
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
              onClick={handleResetQuiz}
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
