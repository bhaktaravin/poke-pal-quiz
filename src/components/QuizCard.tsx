import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PokemonImage } from './PokemonImage';
import { QuizOptions } from './QuizOptions';
import { ScoreDisplay } from './ScoreDisplay';
import { usePokemonQuiz } from '@/hooks/usePokemonQuiz';
import { ArrowRight, RotateCcw, Sparkles, Star, PartyPopper } from 'lucide-react';
import { PlayerNameInput } from './PlayerNameInput';
import { PlayerModeSelect } from './PlayerModeSelect';
import { fireConfetti, fireStreakConfetti, fireGameOverConfetti } from '@/lib/confetti';
import { Link } from 'react-router-dom';

// Fun encouraging messages for kids
const correctMessages = [
  "🎉 Amazing! You're a Pokémon genius!",
  "⚡ Super! You caught that one!",
  "🌟 Wow! Professor Oak would be proud!",
  "✨ Incredible! You're on fire!",
  "🏆 Fantastic! Keep it up, trainer!",
  "💫 Brilliant! That was super effective!",
  "🎯 Perfect! You really know your Pokémon!",
  "🚀 Awesome! You're unstoppable!",
];

const wrongMessages = [
  "😊 Nice try! You'll get the next one!",
  "💪 Don't give up! Every trainer learns!",
  "🌈 Keep going! You're doing great!",
  "⭐ Almost! You're getting better!",
  "🎮 Good effort! Try again!",
];

const streakMessages: Record<number, string> = {
  3: "🔥 3 in a row! You're warming up!",
  5: "⚡ 5 streak! Electrifying!",
  7: "🌟 7 streak! You're a star!",
  10: "🏆 10 streak! Pokémon Master in training!",
  15: "👑 15 streak! LEGENDARY!",
  20: "🎆 20 streak! MYTHICAL STATUS!",
};

const getRandomMessage = (messages: string[]) => 
  messages[Math.floor(Math.random() * messages.length)];

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
    setPlayerName,
    errorMsg,
  } = state;

  // Compute gameOver for both modes
  const gameOver = mode === '2p' ? (player1.gameOver && player2.gameOver) : player1.gameOver;

  // Local state for quizStarted
  const [quizStarted, setQuizStarted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const initialLoadDone = useRef(false);
  const prevAnsweredRef = useRef(false);

  useEffect(() => {
    if (!quizStarted || initialLoadDone.current) return;
    initialLoadDone.current = true;
    loadNewQuestion();
  }, [quizStarted, loadNewQuestion]);

  // Trigger confetti and messages on answer
  useEffect(() => {
    if (hasAnswered && !prevAnsweredRef.current) {
      if (isCorrect) {
        // Get current player's streak for celebration
        const currentStreak = mode === '2p' 
          ? (currentPlayer === 1 ? player1.streak : player2.streak)
          : player1.streak;
        
        // Fire confetti based on streak
        if (currentStreak >= 5) {
          fireStreakConfetti(currentStreak);
        } else {
          fireConfetti();
        }
        
        // Show streak message or random correct message
        const streakMsg = streakMessages[currentStreak];
        setFeedbackMessage(streakMsg || getRandomMessage(correctMessages));
      } else {
        fireGameOverConfetti();
        setFeedbackMessage(getRandomMessage(wrongMessages));
      }
    }
    prevAnsweredRef.current = hasAnswered;
  }, [hasAnswered, isCorrect, mode, currentPlayer, player1.streak, player2.streak]);

  // Reset quizStarted on reset
  const handleResetQuiz = useCallback(() => {
    setQuizStarted(false);
    initialLoadDone.current = false;
    setFeedbackMessage('');
    resetQuiz();
  }, [resetQuiz]);

  if (!mode) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <PlayerModeSelect mode={mode} setMode={() => {}} />
      </div>
    );
  }

  if (mode === '2p' && (!player1.name || !player2.name)) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        {!player1.name && (
          <PlayerNameInput
            key="p1"
            onSubmit={name => setPlayerName(name)}
            onStart={() => {}}
            playerNumber={1}
          />
        )}
        {player1.name && !player2.name && (
          <PlayerNameInput
            key="p2"
            onSubmit={name => setPlayerName(name)}
            onStart={() => setQuizStarted(true)}
            playerNumber={2}
          />
        )}
      </div>
    );
  }

  if (mode === '1p' && !player1.name) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <PlayerNameInput
          onSubmit={name => setPlayerName(name)}
          onStart={() => setQuizStarted(true)}
        />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-4">{errorMsg}</p>
          <Button variant="outline" size="lg" onClick={loadNewQuestion}>Try Another Pokémon</Button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const winner = mode === '2p' 
      ? (player1.score > player2.score ? player1.name : player2.score > player1.score ? player2.name : null)
      : null;
    const isTie = mode === '2p' && player1.score === player2.score;
    const topScore = Math.max(player1.score, player2.score);

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
          {/* Fun game over header */}
          <div className="flex items-center gap-3 mb-4">
            <PartyPopper className="w-8 h-8 text-primary animate-bounce" />
            <h2 className="text-3xl font-extrabold text-accent">Game Over!</h2>
            <PartyPopper className="w-8 h-8 text-primary animate-bounce" />
          </div>
          
          {/* Show what the Pokemon was */}
          <p className="text-xl mb-4 text-center">
            It was <span className="text-primary font-bold">{currentPokemon?.name}</span>!
          </p>

          {/* 2-player winner announcement */}
          {mode === '2p' && (
            <div className="text-center mb-6">
              {isTie ? (
                <div className="bg-secondary/20 rounded-xl p-4 mb-4">
                  <p className="text-2xl font-bold text-secondary">
                    🤝 It's a tie! 🤝
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Both trainers scored {topScore} points!
                  </p>
                </div>
              ) : winner && (
                <div className="bg-primary/20 rounded-xl p-4 mb-4 animate-bounce-in">
                  <p className="text-2xl font-bold text-primary">
                    👑 {winner} wins! 👑
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Congratulations, Pokémon Master!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Encouraging message */}
          <div className="bg-muted/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-lg">
              {topScore >= 10 
                ? "🌟 Wow! You're becoming a real Pokémon Master! 🌟"
                : topScore >= 5
                ? "⭐ Great job! Keep training to catch more! ⭐"
                : "💪 Every trainer starts somewhere! Play again! 💪"
              }
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleResetQuiz} size="xl" className="glow-primary gap-2">
              <Star className="w-5 h-5" />
              Play Again
            </Button>
            <Link to="/leaderboard">
              <Button variant="outline" size="xl" className="gap-2 w-full">
                🏆 View Leaderboard
              </Button>
            </Link>
          </div>
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
            {['player1', 'player2'].map((p, idx) => {
              const player = p === 'player1' ? player1 : player2;
              let className = '';
              if (quizStarted) {
                if (gameOver) className = 'opacity-50';
                else if (currentPlayer === idx + 1) className = 'ring-2 ring-primary';
              }
              let displayName = player.name || `Player ${idx + 1}`;
              if (currentPlayer === idx + 1 && !gameOver) displayName += ' (Your turn)';
              return (
                <div className={className} key={p}>
                  <ScoreDisplay
                    score={player.score}
                    totalQuestions={player.totalQuestions}
                    streak={player.streak}
                    bestStreak={player.bestStreak}
                    playerName={displayName}
                  />
                </div>
              );
            })}
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
            {hasAnswered ? (isCorrect ? "🎉 You Got It! 🎉" : "😮 Oops!") : "Who's That Pokémon?"}
          </h2>
          <p className={`text-lg ${hasAnswered && !isCorrect ? 'text-accent font-bold' : hasAnswered && isCorrect ? 'text-green-400 font-bold' : 'text-muted-foreground'}`}>
            {(() => {
              if (!hasAnswered) return "🎯 Guess the Pokémon from its silhouette!";
              if (isCorrect) return feedbackMessage || "That's correct! 🎉";
              return feedbackMessage || `It was ${currentPokemon?.name}!`;
            })()}
          </p>
          {hasAnswered && !isCorrect && currentPokemon && (
            <p className="text-xl text-primary font-bold mt-2 animate-bounce-in">
              It was {currentPokemon.name}!
            </p>
          )}
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
