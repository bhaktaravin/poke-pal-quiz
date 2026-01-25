import { Trophy, Target, Sparkles, Star } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  totalQuestions: number;
  streak: number;
  bestStreak: number;
  playerName?: string;
}

const getStreakEmoji = (streak: number) => {
  if (streak >= 10) return '🔥';
  if (streak >= 5) return '⚡';
  if (streak >= 3) return '✨';
  return '💫';
};

const getScoreTitle = (score: number) => {
  if (score >= 20) return { title: 'Pokémon Master', emoji: '👑' };
  if (score >= 15) return { title: 'Elite Trainer', emoji: '🌟' };
  if (score >= 10) return { title: 'Gym Leader', emoji: '⭐' };
  if (score >= 5) return { title: 'Rising Star', emoji: '✨' };
  return { title: 'Trainer', emoji: '🎮' };
};

export const ScoreDisplay = ({ score, totalQuestions, streak, bestStreak, playerName }: ScoreDisplayProps) => {
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const { title, emoji } = getScoreTitle(score);

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-muted/20">
      {playerName && (
        <div className="text-center">
          <div className="text-lg font-bold text-primary flex items-center gap-2 justify-center">
            <Sparkles className="w-5 h-5" />
            {playerName}
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-sm text-muted-foreground">
            {emoji} {title}
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {/* Score */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full card-gradient border border-primary/30 shadow-lg">
          <Star className="w-5 h-5 text-primary" />
          <span className="text-foreground font-black text-lg">{score}</span>
          <span className="text-muted-foreground text-sm">pts</span>
        </div>
        
        {/* Streak */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full card-gradient border shadow-lg ${
          streak > 0 ? 'border-accent/50' : 'border-border'
        }`}>
          <span className="text-lg">{getStreakEmoji(streak)}</span>
          <span className={`font-black text-lg ${streak > 0 ? 'text-accent' : 'text-muted-foreground'}`}>
            {streak}
          </span>
          <span className="text-muted-foreground text-sm">streak</span>
        </div>
        
        {/* Accuracy */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full card-gradient border border-secondary/30 shadow-lg">
          <Target className="w-5 h-5 text-secondary" />
          <span className="text-secondary font-black text-lg">{accuracy}%</span>
        </div>
        
        {/* Best Streak Badge */}
        {bestStreak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 shadow-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">Best: {bestStreak}</span>
          </div>
        )}
      </div>
    </div>
  );
};
