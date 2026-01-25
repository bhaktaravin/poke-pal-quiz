import confetti from 'canvas-confetti';

// Pokémon-themed confetti colors
const pokemonColors = ['#FFDE00', '#3B4CCA', '#FF0000', '#CC0000', '#B3A125'];

export const fireConfetti = () => {
  // Fire from both sides
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: pokemonColors,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export const fireStreakConfetti = (streak: number) => {
  // More confetti for bigger streaks!
  const intensity = Math.min(streak * 0.2, 1);
  
  confetti({
    particleCount: Math.floor(50 + streak * 20),
    spread: 60 + streak * 10,
    origin: { y: 0.6 },
    colors: pokemonColors,
    scalar: 1 + intensity * 0.5,
  });
};

export const fireStarConfetti = () => {
  // Gentle star-shaped celebration
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: pokemonColors,
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle'],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};

export const fireGameOverConfetti = () => {
  // Sad but encouraging confetti
  confetti({
    particleCount: 30,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#888888', '#AAAAAA', '#666666'],
    gravity: 1.5,
  });
};
