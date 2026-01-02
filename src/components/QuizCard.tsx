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
  const state = usePokemonQuiz();
  const {
    mode,
    player1,
    player2,
    currentPlayer,
    currentPokemon,
    options,
    isLoading,
    hasAnswered,
    selectedAnswer,
    isCorrect,
    loadNewQuestion,
    submitAnswer,
    resetQuiz,
    gameOver,
    setPlayerName,
    quizStarted,
    setQuizStarted,
  } = state;



  // Reset quizStarted on reset
  const handleResetQuiz = useCallback(() => {
    setQuizStarted(false);
    resetQuiz();
  }, [resetQuiz, setQuizStarted]);

  if (!mode) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <PlayerModeSelect mode={mode} setMode={state.setMode} />
      </div>
    );
  }



  if (mode === '2p' && (!player1.name || !player2.name)) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        {!player1.name && <PlayerNameInput key="p1" onSubmit={name => { setPlayerName(1, name); setQuizStarted(false); }} />}
        {player1.name && !player2.name && <PlayerNameInput key="p2" onSubmit={name => { setPlayerName(2, name); setQuizStarted(false); }} />}
      </div>
    );
  }

  if (mode === '1p' && !player1.name) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <PlayerNameInput onSubmit={name => { setPlayerName(1, name); setQuizStarted(false); }} />
      </div>
    );
  }


  if (gameOver) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="mb-8">
          {mode === '2p' ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <ScoreDisplay
                score={player1.score}
                totalQuestions={player1.totalQuestions}
                streak={player1.streak}
                bestStreak={player1.bestStreak}
                playerName={player1.name || 'Player 1'}
              />
              <ScoreDisplay
                score={player2.score}
                totalQuestions={player2.totalQuestions}
                streak={player2.streak}
                bestStreak={player2.bestStreak}
                playerName={player2.name || 'Player 2'}
              />
            </div>
          ) : (
            <ScoreDisplay
              score={player1.score}
              totalQuestions={player1.totalQuestions}
              streak={player1.streak}
              bestStreak={player1.bestStreak}
              playerName={player1.name}
            />
          )}
        </div>
        <div className="card-gradient rounded-3xl border border-border p-6 md:p-10 shadow-2xl flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-accent mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Wrong! It was {currentPokemon?.name}!</p>
          <Button onClick={handleResetQuiz} size="xl" className="glow-primary">Play Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Score Display */}
      <div className="mb-8">
        {mode === '2p' ? (
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className={quizStarted ? (gameOver ? 'opacity-50' : (currentPlayer === 1 ? 'ring-2 ring-primary' : '')) : ''}>
              <ScoreDisplay
                score={player1.score}
                totalQuestions={player1.totalQuestions}
                streak={player1.streak}
                bestStreak={player1.bestStreak}
                playerName={player1.name ? `${player1.name}${currentPlayer === 1 && !gameOver ? ' (Your turn)' : ''}` : 'Player 1'}
              />
            </div>
            <div className={quizStarted ? (gameOver ? 'opacity-50' : (currentPlayer === 2 ? 'ring-2 ring-primary' : '')) : ''}>
              <ScoreDisplay
                score={player2.score}
                totalQuestions={player2.totalQuestions}
                streak={player2.streak}
                bestStreak={player2.bestStreak}
                playerName={player2.name ? `${player2.name}${currentPlayer === 2 && !gameOver ? ' (Your turn)' : ''}` : 'Player 2'}
              />
            </div>
          </div>
        ) : (
          <ScoreDisplay
            score={player1.score}
            totalQuestions={player1.totalQuestions}
            streak={player1.streak}
            bestStreak={player1.bestStreak}
            playerName={player1.name}
          />
        )}
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
          
          {(player1.totalQuestions > 0 || player2.totalQuestions > 0) && (
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
