import { useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/components/config/firestore';
import { toast } from '@/hooks/use-toast';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
}

interface PlayerStats {
  name: string;
  score: number;
  streak: number;
  bestStreak: number;
  totalQuestions: number;
  gameOver: boolean;
}

interface QuizState {
  mode: '1p' | '2p';
  player1: PlayerStats;
  player2: PlayerStats;
  currentPlayer: 1 | 2;
  currentPokemon: Pokemon | null;
  options: string[];
  isLoading: boolean;
  hasAnswered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  usedPokemonIds: number[];
  errorMsg?: string;
}

const MAX_POKEMON_ID = 251; // Gen 1 + Gen 2

const getRandomPokemonIds = (count: number, exclude?: number): number[] => {
  const ids: number[] = [];
  while (ids.length < count) {
    const id = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
    if (!ids.includes(id) && id !== exclude) {
      ids.push(id);
    }
  }
  return ids;
};

const formatPokemonName = (name: string): string => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const usePokemonQuiz = () => {
  const [state, setState] = useState<QuizState>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('poke-pal-quiz:player');
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        console.log('Initial state from localStorage:', loaded);
        return loaded;
      } catch {}
    }
    const initial = {
      mode: '1p',
      player1: { name: '', score: 0, streak: 0, bestStreak: 0, totalQuestions: 0, gameOver: false },
      player2: { name: '', score: 0, streak: 0, bestStreak: 0, totalQuestions: 0, gameOver: false },
      currentPlayer: 1,
      currentPokemon: null,
      options: [],
      isLoading: true,
      hasAnswered: false,
      selectedAnswer: null,
      isCorrect: null,
      usedPokemonIds: [],
    };
    console.log('Initial state:', initial);
    return initial;
  });

  // Persist to localStorage on change
  const persist = (next: QuizState) => {
    localStorage.setItem('poke-pal-quiz:player', JSON.stringify(next));
  };

  const fetchPokemon = async (id: number): Promise<Pokemon> => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!response.ok) {
        throw new Error(`Pokémon with ID ${id} not found.`);
      }
      const data = await response.json();
      return {
        id: data.id,
        name: formatPokemonName(data.name),
        sprite: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '',
      };
    } catch (error) {
      console.error(error);
      return {
        id,
        name: `Unknown Pokémon (${id})`,
        sprite: '',
      };
    }
  };

  const loadNewQuestion = useCallback(async () => {
    setState(prev => {
      // Don't load new question if game is over for current player (1p) or both (2p)
      if (
        (prev.mode === '1p' && prev.player1.gameOver) ||
        (prev.mode === '2p' && prev.player1.gameOver && prev.player2.gameOver)
      ) {
        return prev;
      }
      return { ...prev, isLoading: true, hasAnswered: false, selectedAnswer: null, isCorrect: null };
    });

    try {
      // Use functional update to always get latest state
      let usedIds: number[] = [];
      setState(prev => {
        usedIds = prev.usedPokemonIds;
        return prev;
      });

      // Get available Pokemon IDs (not yet used)
      let availableIds = Array.from({ length: MAX_POKEMON_ID }, (_, i) => i + 1)
        .filter(id => !usedIds.includes(id));

      // If all Pokemon have been used, reset the pool
      if (availableIds.length === 0) {
        availableIds = Array.from({ length: MAX_POKEMON_ID }, (_, i) => i + 1);
        usedIds = [];
      }

      // Pick a random Pokemon from available ones
      const correctId = availableIds[Math.floor(Math.random() * availableIds.length)];
      const wrongIds = getRandomPokemonIds(3, correctId);

      // Fetch all Pokemon data
      const [correctPokemon, ...wrongPokemon] = await Promise.all([
        fetchPokemon(correctId),
        ...wrongIds.map(id => fetchPokemon(id)),
      ]);

      // Shuffle options
      const allOptions = [correctPokemon.name, ...wrongPokemon.map(p => p.name)];
      const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);

      setState(prev => {
        let errorMsg = '';
        if (!correctPokemon.sprite) {
          errorMsg = `Pokémon with ID ${correctId} could not be loaded. Please check your MAX_POKEMON_ID.`;
        }
        const next = {
          ...prev,
          currentPokemon: correctPokemon,
          options: shuffledOptions,
          isLoading: false,
          hasAnswered: false,
          selectedAnswer: null,
          isCorrect: null,
          gameOver: false,
          usedPokemonIds: [...usedIds, correctId],
          errorMsg,
        };
        console.log('State after loading question:', next);
        persist(next);
        return next;
      });
    } catch (error) {
      console.error('Failed to load Pokemon:', error);
      // Retry on error
      setTimeout(loadNewQuestion, 1000);
    }
  }, []);

  const submitAnswer = useCallback(async (answer: string) => {
    console.log('submitAnswer called with:', answer);
    let prevState: QuizState | undefined;
    setState(prev => {
      prevState = prev;
      if (prev.hasAnswered || !prev.currentPokemon) return prev;
      if (!answer || !prev.options.includes(answer)) {
        console.warn('submitAnswer blocked: invalid answer or options not ready');
        return prev;
      }

      const isCorrect = answer === prev.currentPokemon.name;
      let next = { ...prev, hasAnswered: true, selectedAnswer: answer, isCorrect };

      // 2-player logic
      if (prev.mode === '2p') {
        const current = prev.currentPlayer;
        const other = current === 1 ? 2 : 1;
        const playerKey = current === 1 ? 'player1' : 'player2';
        const player = prev[playerKey];
        const newStreak = isCorrect ? player.streak + 1 : 0;
        const updatedPlayer = {
          ...player,
          score: isCorrect ? player.score + 1 : player.score,
          streak: newStreak,
          bestStreak: Math.max(player.bestStreak, newStreak),
          totalQuestions: player.totalQuestions + 1,
          gameOver: !isCorrect,
        };
        next = {
          ...next,
          [playerKey]: updatedPlayer,
          currentPlayer: !isCorrect ? other : current,
        };
        // If both players are out, nothing to do, gameOver is computed from both players
      } else {
        // 1-player logic
        const newStreak = isCorrect ? prev.player1.streak + 1 : 0;
        next = {
          ...next,
          player1: {
            ...prev.player1,
            score: isCorrect ? prev.player1.score + 1 : prev.player1.score,
            streak: newStreak,
            bestStreak: Math.max(prev.player1.bestStreak, newStreak),
            totalQuestions: prev.player1.totalQuestions + 1,
            gameOver: !isCorrect,
          },
        };
      }
      persist(next);
      return next;
    });

    // Firestore write outside setState for visibility
    if (prevState && !prevState.hasAnswered && prevState.currentPokemon && answer && prevState.options.includes(answer)) {
      const isCorrect = answer === prevState.currentPokemon.name;
      if (prevState.mode === '2p') {
        const current = prevState.currentPlayer;
        const player = current === 1 ? prevState.player1 : prevState.player2;
        if (!isCorrect && player.name) {
          console.log('Attempting to save score to Firestore...');
          try {
            await addDoc(collection(db, 'scores'), {
              name: player.name,
              score: player.score,
              streak: player.streak,
              totalQuestions: player.totalQuestions,
              timestamp: new Date().toISOString(),
            });
            toast({
              title: 'Score saved!',
              description: `Score for ${player.name} was saved to the leaderboard.`,
            });
            console.log('Score saved to Firestore!');
          } catch (e) {
            toast({
              title: 'Error saving score',
              description: 'Could not save your score. Please try again.',
            });
            console.error('Error saving score to Firestore:', e);
          }
        }
      } else {
        if (!isCorrect && prevState.player1.name) {
          console.log('Attempting to save score to Firestore...');
          try {
            await addDoc(collection(db, 'scores'), {
              name: prevState.player1.name,
              score: prevState.player1.score,
              streak: prevState.player1.streak,
              totalQuestions: prevState.player1.totalQuestions,
              timestamp: new Date().toISOString(),
            });
            toast({
              title: 'Score saved!',
              description: `Your score was saved to the leaderboard.`,
            });
            console.log('Score saved to Firestore!');
          } catch (e) {
            toast({
              title: 'Error saving score',
              description: 'Could not save your score. Please try again.',
            });
            console.error('Error saving score to Firestore:', e);
          }
        }
      }
    }
  }, []);

  const resetQuiz = useCallback(() => {
    setState(prev => {
      const next = {
        ...prev,
        player1: { ...prev.player1, name: '', score: 0, streak: 0, bestStreak: 0, totalQuestions: 0, gameOver: false },
        player2: { ...prev.player2, name: '', score: 0, streak: 0, bestStreak: 0, totalQuestions: 0, gameOver: false },
        currentPlayer: 1,
        currentPokemon: null,
        options: [],
        isLoading: true,
        hasAnswered: false,
        selectedAnswer: null,
        isCorrect: null,
        usedPokemonIds: [],
        errorMsg: '',
      };
      persist(next);
      return next;
    });
    loadNewQuestion();
  }, [loadNewQuestion]);

  // Set player name
  const setPlayerName = useCallback((name: string) => {
    setState(prev => {
      if (prev.mode === '2p') {
        if (prev.player1.name) {
          if (prev.player2.name) {
            const next = { ...prev, player1: { ...prev.player1, name } };
            persist(next);
            return next;
          }
          const next = { ...prev, player2: { ...prev.player2, name } };
          persist(next);
          return next;
        }
        const next = { ...prev, player1: { ...prev.player1, name } };
        persist(next);
        return next;
      }

      const next = { ...prev, player1: { ...prev.player1, name } };
      persist(next);
      return next;
    });
  }, []);

  return {
    ...state,
    loadNewQuestion,
    submitAnswer,
    resetQuiz,
    setPlayerName,
  };
};
