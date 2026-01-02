import { Button } from '@/components/ui/button';

interface PlayerModeSelectProps {
  mode: '1p' | '2p' | null;
  setMode: (mode: '1p' | '2p') => void;
}

export const PlayerModeSelect = ({ mode, setMode }: PlayerModeSelectProps) => (
  <div className="flex flex-col items-center gap-4 mb-8">
    <h2 className="text-xl font-bold mb-2">Select Game Mode</h2>
    <div className="flex gap-4">
      <Button
        variant={mode === '1p' ? 'default' : 'outline'}
        size="lg"
        onClick={() => setMode('1p')}
      >
        1 Player
      </Button>
      <Button
        variant={mode === '2p' ? 'default' : 'outline'}
        size="lg"
        onClick={() => setMode('2p')}
      >
        2 Player
      </Button>
    </div>
  </div>
);
