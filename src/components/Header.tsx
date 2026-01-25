import { Link } from 'react-router-dom';
import { Trophy, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  return (
    <header className="text-center py-8 md:py-12">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center glow-primary animate-pulse-glow">
          <span className="text-2xl md:text-3xl">⚡</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black">
          <span className="text-gradient">Poké</span>
          <span className="text-foreground">Quiz</span>
        </h1>
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent flex items-center justify-center">
          <span className="text-2xl md:text-3xl">🎮</span>
        </div>
      </div>
      <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto mb-6">
        ✨ Test your Pokémon knowledge! Can you catch 'em all? ✨
      </p>
      
      {/* Navigation buttons */}
      <div className="flex justify-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="lg" className="gap-2 text-lg">
            <Gamepad2 className="w-5 h-5" />
            Play
          </Button>
        </Link>
        <Link to="/leaderboard">
          <Button variant="ghost" size="lg" className="gap-2 text-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Leaderboard
          </Button>
        </Link>
      </div>
    </header>
  );
};
