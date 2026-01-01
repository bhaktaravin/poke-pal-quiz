import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PlayerNameInputProps {
  onSubmit: (name: string) => void;
  initialName?: string;
}

export const PlayerNameInput = ({ onSubmit, initialName = '' }: PlayerNameInputProps) => {
  const [name, setName] = useState(initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mb-8">
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
        className="max-w-xs text-center"
        maxLength={24}
        required
      />
      <Button type="submit" size="lg" className="w-full max-w-xs">Start Quiz</Button>
    </form>
  );
};
