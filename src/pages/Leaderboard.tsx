import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/components/config/firestore';
import { Header } from '@/components/Header';
import { Trophy, Star, Flame, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  streak: number;
  totalQuestions: number;
  timestamp: string;
}

const getRankEmoji = (rank: number) => {
  switch (rank) {
    case 1: return '👑';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '⭐';
  }
};

const getRankTitle = (rank: number) => {
  switch (rank) {
    case 1: return 'Pokémon Master';
    case 2: return 'Elite Four';
    case 3: return 'Gym Leader';
    default: return 'Trainer';
  }
};

const getEncouragingMessage = (score: number) => {
  if (score >= 20) return "🔥 Legendary status!";
  if (score >= 15) return "⚡ Super effective!";
  if (score >= 10) return "✨ You're on fire!";
  if (score >= 5) return "💪 Keep training!";
  return "🌟 Great effort!";
};

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'scores'),
      orderBy('score', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        scores.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
      });
      setEntries(scores);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-12 px-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Title with fun animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-primary animate-bounce" />
              <h1 className="text-3xl md:text-4xl font-black">
                <span className="text-gradient">Hall of</span>{' '}
                <span className="text-foreground">Fame</span>
              </h1>
              <Trophy className="w-10 h-10 text-primary animate-bounce" />
            </div>
            <p className="text-muted-foreground text-lg">
              🏆 Top Pokémon Trainers 🏆
            </p>
          </div>

          {/* Back to Quiz button */}
          <div className="flex justify-center mb-6">
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Play Quiz
              </Button>
            </Link>
          </div>

          {/* Leaderboard */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="card-gradient rounded-3xl border border-border p-8 text-center">
              <p className="text-xl text-muted-foreground mb-4">
                No scores yet! Be the first Pokémon Master! 🎮
              </p>
              <Link to="/">
                <Button size="lg" className="glow-primary">
                  Start Playing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                
                return (
                  <div
                    key={entry.id}
                    className={`card-gradient rounded-2xl border p-4 md:p-5 transition-all duration-300 hover:scale-[1.02] ${
                      isTopThree 
                        ? 'border-primary/50 shadow-lg shadow-primary/20' 
                        : 'border-border'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black ${
                        rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                        rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {getRankEmoji(rank)}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg text-foreground truncate">
                            {entry.name}
                          </span>
                          {rank === 1 && <Crown className="w-5 h-5 text-yellow-400" />}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            {getRankTitle(rank)}
                          </span>
                          <span>{getEncouragingMessage(entry.score)}</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-black text-primary">{entry.score}</span>
                        </div>
                        {entry.streak > 0 && (
                          <div className="flex items-center gap-1 text-sm text-accent">
                            <Flame className="w-4 h-4" />
                            <span>{entry.streak} streak</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fun footer message */}
          <div className="text-center mt-8 text-muted-foreground">
            <p className="text-lg">🎯 Can you beat the top score? 🎯</p>
            <p className="text-sm mt-2">Gotta catch 'em all!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
