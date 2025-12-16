import { useState, useCallback } from 'react';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
}

interface QuizState {
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
}

const MAX_POKEMON_ID = 898; // Gen 1-8

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
  const [state, setState] = useState<QuizState>({
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
  });

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
    setState(prev => ({ ...prev, isLoading: true, hasAnswered: false, selectedAnswer: null, isCorrect: null }));

    try {
      // Get random Pokemon IDs for the question
      const correctId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
      const wrongIds = getRandomPokemonIds(3, correctId);

      // Fetch all Pokemon data
      const [correctPokemon, ...wrongPokemon] = await Promise.all([
        fetchPokemon(correctId),
        ...wrongIds.map(id => fetchPokemon(id)),
      ]);

      // Shuffle options
      const allOptions = [correctPokemon.name, ...wrongPokemon.map(p => p.name)];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      setState(prev => ({
        ...prev,
        currentPokemon: correctPokemon,
        options: shuffledOptions,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load Pokemon:', error);
      // Retry on error
      setTimeout(loadNewQuestion, 1000);
    }
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    if (state.hasAnswered || !state.currentPokemon) return;

    const isCorrect = answer === state.currentPokemon.name;

    setState(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        ...prev,
        hasAnswered: true,
        selectedAnswer: answer,
        isCorrect,
        score: isCorrect ? prev.score + 1 : prev.score,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalQuestions: prev.totalQuestions + 1,
      };
    });
  }, [state.hasAnswered, state.currentPokemon]);

  const resetQuiz = useCallback(() => {
    setState({
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
    });
    loadNewQuestion();
  }, [loadNewQuestion]);

  return {
    ...state,
    loadNewQuestion,
    submitAnswer,
    resetQuiz,
  };
};
