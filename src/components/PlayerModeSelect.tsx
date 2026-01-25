import { Button } from '@/components/ui/button';
import { User, Users, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlayerModeSelectProps {
  mode: '1p' | '2p' | null;
  setMode: (mode: '1p' | '2p') => void;
}

export const PlayerModeSelect = ({ mode, setMode }: PlayerModeSelectProps) => (
  <div className="card-gradient rounded-3xl border border-border p-8 md:p-12 shadow-2xl flex flex-col items-center">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-4xl font-black mb-4">
        <span className="text-gradient">Choose Your</span>{' '}
        <span className="text-foreground">Adventure!</span>
      </h2>
      <p className="text-muted-foreground text-lg">
        🎮 How do you want to play? 🎮
      </p>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mb-8">
      <Button
        variant={mode === '1p' ? 'default' : 'outline'}
        size="xl"
        onClick={() => setMode('1p')}
        className="h-32 flex flex-col gap-3 text-xl hover:scale-105 transition-transform"
      >
        <User className="w-10 h-10" />
        <span>Solo Trainer</span>
        <span className="text-sm opacity-75">Train alone!</span>
      </Button>
      <Button
        variant={mode === '2p' ? 'default' : 'outline'}
        size="xl"
        onClick={() => setMode('2p')}
        className="h-32 flex flex-col gap-3 text-xl hover:scale-105 transition-transform"
      >
        <Users className="w-10 h-10" />
        <span>Battle Mode</span>
        <span className="text-sm opacity-75">Challenge a friend!</span>
      </Button>
    </div>

    <Link to="/leaderboard" className="w-full max-w-lg">
      <Button
        variant="ghost"
        size="lg"
        className="w-full gap-3 text-lg"
      >
        <Trophy className="w-6 h-6 text-yellow-400" />
        View Leaderboard
      </Button>
    </Link>
  </div>
);
