export const Header = () => {
  return (
    <header className="text-center py-8 md:py-12">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center glow-primary">
          <span className="text-2xl md:text-3xl">⚡</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black">
          <span className="text-gradient">Poké</span>
          <span className="text-foreground">Quiz</span>
        </h1>
      </div>
      <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
        Test your Pokémon knowledge! Can you catch 'em all?
      </p>
    </header>
  );
};
