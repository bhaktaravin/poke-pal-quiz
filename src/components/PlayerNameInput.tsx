import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';

interface PlayerNameInputProps {
  onSubmit: (name: string) => void;
  initialName?: string;
  onStart?: () => void;
  playerNumber?: number;
}

const trainerTitles = [
  "Ace Trainer",
  "Pokémon Ranger",
  "Bug Catcher",
  "Gym Leader",
  "Champion",
];

export const PlayerNameInput = ({ onSubmit, initialName = '', onStart, playerNumber }: PlayerNameInputProps) => {
  const [name, setName] = useState(initialName);
  const randomTitle = trainerTitles[Math.floor(Math.random() * trainerTitles.length)];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      if (onStart) onStart();
    }
  };

  return (
    <div className="card-gradient rounded-3xl border border-border p-8 md:p-12 shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-black">
              {playerNumber ? `Player ${playerNumber}` : 'Welcome, Trainer!'}
            </h2>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">
            🎯 What's your trainer name? 🎯
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`Enter name (e.g., ${randomTitle})`}
            className="text-center text-xl h-14 rounded-xl border-2 border-primary/30 focus:border-primary"
            maxLength={24}
            required
            autoFocus
          />
          
          <Button 
            type="submit" 
            size="xl" 
            className="w-full glow-primary gap-2 text-xl h-14"
            disabled={!name.trim()}
          >
            <Zap className="w-6 h-6" />
            {playerNumber === 2 ? "Start Battle!" : "Let's Go!"}
          </Button>
        </div>

        <p className="text-muted-foreground text-sm">
          ✨ Your score will be saved to the leaderboard! ✨
        </p>
      </form>
    </div>
  );
};
