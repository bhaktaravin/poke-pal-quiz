import { useState, useCallback } from 'react';

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
        return JSON.parse(saved);
      } catch {}
    }
    return {
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
    };
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
      const next = { ...prev, isLoading: true, hasAnswered: false, selectedAnswer: null, isCorrect: null };
      persist(next);
      return next;
    });

    try {
      // Get available Pokemon IDs (not yet used)
      let availableIds = Array.from({ length: MAX_POKEMON_ID }, (_, i) => i + 1)
        .filter(id => !state.usedPokemonIds.includes(id));
      
      // If all Pokemon have been used, reset the pool
      if (availableIds.length === 0) {
        availableIds = Array.from({ length: MAX_POKEMON_ID }, (_, i) => i + 1);
        setState(prev => {
          const next = { ...prev, usedPokemonIds: [] };
          persist(next);
          return next;
        });
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
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      setState(prev => {
        const next = {
          ...prev,
          currentPokemon: correctPokemon,
          options: shuffledOptions,
          isLoading: false,
          usedPokemonIds: [...prev.usedPokemonIds, correctId],
        };
        persist(next);
        return next;
      });
    } catch (error) {
      console.error('Failed to load Pokemon:', error);
      // Retry on error
      setTimeout(loadNewQuestion, 1000);
    }
  }, [state.usedPokemonIds]);

  const submitAnswer = useCallback((answer: string) => {
    if (state.hasAnswered || !state.currentPokemon) return;

    const isCorrect = answer === state.currentPokemon.name;

    setState(prev => {
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
      };
      persist(next);
      return next;
    });
  }, [state.hasAnswered, state.currentPokemon]);

  const resetQuiz = useCallback(() => {
    setState(prev => {
      const next = {
        ...prev,
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
