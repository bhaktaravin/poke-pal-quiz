import { useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/components/config/firestore';
import { toast } from '@/hooks/use-toast';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
}

interface QuizState {
  playerName: string;
  currentPokemon: Pokemon | null;
  options: string[];
  score: number;
  streak: number;
  bestStreak: number;
  totalQuestions: number;
  isLoading: boolean;
  hasAnswered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  usedPokemonIds: number[];
  gameOver: boolean;
}

const MAX_POKEMON_ID = 151; // Original 151 (Gen 1)

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
      playerName: '',
      currentPokemon: null,
      options: [],
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalQuestions: 0,
      isLoading: true,
      hasAnswered: false,
      selectedAnswer: null,
      isCorrect: null,
      usedPokemonIds: [],
      gameOver: false,
    };
    console.log('Initial state:', initial);
    return initial;
  });

  // Persist to localStorage on change
  const persist = (next: QuizState) => {
    localStorage.setItem('poke-pal-quiz:player', JSON.stringify(next));
  };

  const fetchPokemon = async (id: number): Promise<Pokemon> => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    return {
      id: data.id,
      name: formatPokemonName(data.name),
      sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    };
  };

  const loadNewQuestion = useCallback(async () => {
    setState(prev => {
      if (prev.gameOver) return prev; // Don't load new question if game is over
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
      if (prev.hasAnswered || !prev.currentPokemon || prev.gameOver) return prev;
      if (!answer || !prev.options.includes(answer)) {
        console.warn('submitAnswer blocked: invalid answer or options not ready');
        return prev;
      }

      const isCorrect = answer === prev.currentPokemon.name;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const next = {
        ...prev,
        hasAnswered: true,
        selectedAnswer: answer,
        isCorrect,
        score: isCorrect ? prev.score + 1 : prev.score,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalQuestions: prev.totalQuestions + 1,
        gameOver: !isCorrect, // End game if wrong answer
      };
      persist(next);
      return next;
    });

    // Firestore write outside setState for visibility
    if (prevState && !prevState.hasAnswered && prevState.currentPokemon && !prevState.gameOver && answer && prevState.options.includes(answer)) {
      const isCorrect = answer === prevState.currentPokemon.name;
      if (!isCorrect && prevState.playerName) {
        console.log('Attempting to save score to Firestore...');
        try {
          await addDoc(collection(db, 'scores'), {
            name: prevState.playerName,
            score: prevState.score,
            streak: prevState.streak,
            totalQuestions: prevState.totalQuestions,
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
  }, []);

  const resetQuiz = useCallback(() => {
    setState(prev => {
      const next = {
        ...prev,
        playerName: '',
        currentPokemon: null,
        options: [],
        score: 0,
        streak: 0,
        bestStreak: 0,
        totalQuestions: 0,
        isLoading: true,
        hasAnswered: false,
        selectedAnswer: null,
        isCorrect: null,
        usedPokemonIds: [],
        gameOver: false,
      };
      persist(next);
      return next;
    });
    loadNewQuestion();
  }, [loadNewQuestion]);

  // Set player name
  const setPlayerName = useCallback((name: string) => {
    setState(prev => {
      const next = { ...prev, playerName: name };
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
