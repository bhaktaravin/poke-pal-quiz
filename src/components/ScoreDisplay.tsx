import { Trophy, Flame, Target } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  totalQuestions: number;
  streak: number;
  bestStreak: number;
}

export const ScoreDisplay = ({ score, totalQuestions, streak, bestStreak }: ScoreDisplayProps) => {
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full card-gradient border border-border">
        <Trophy className="w-5 h-5 text-primary" />
        <span className="text-foreground font-bold">{score}</span>
        <span className="text-muted-foreground text-sm">/ {totalQuestions}</span>
      </div>
      
      <div className="flex items-center gap-2 px-4 py-2 rounded-full card-gradient border border-border">
        <Flame className={`w-5 h-5 ${streak > 0 ? 'text-accent' : 'text-muted-foreground'}`} />
        <span className={`font-bold ${streak > 0 ? 'text-accent' : 'text-muted-foreground'}`}>
          {streak}
        </span>
        <span className="text-muted-foreground text-sm">streak</span>
      </div>
      
      <div className="flex items-center gap-2 px-4 py-2 rounded-full card-gradient border border-border">
        <Target className="w-5 h-5 text-secondary" />
        <span className="text-secondary font-bold">{accuracy}%</span>
        <span className="text-muted-foreground text-sm">accuracy</span>
      </div>
      
      {bestStreak > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full card-gradient border border-primary/30">
          <span className="text-primary font-bold">🏆 Best: {bestStreak}</span>
        </div>
      )}
    </div>
  );
};
