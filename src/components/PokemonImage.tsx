import { useState } from 'react';

interface PokemonImageProps {
  src: string;
  name: string;
  revealed: boolean;
}

export const PokemonImage = ({ src, name, revealed }: PokemonImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          revealed 
            ? 'bg-primary/20 blur-3xl scale-110' 
            : 'bg-secondary/10 blur-2xl'
        }`}
      />
      
      {/* Pokemon image */}
      <div className={`relative z-10 transition-all duration-500 ${revealed ? 'animate-bounce-in' : ''}`}>
        <img
          src={src}
          alt={revealed ? name : "Who's that Pokémon?"}
          className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${!revealed ? 'brightness-0 contrast-200' : 'animate-float'}`}
          onLoad={() => setIsLoaded(true)}
          draggable={false}
        />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
