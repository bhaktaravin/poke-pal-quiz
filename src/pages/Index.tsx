import { Header } from '@/components/Header';
import { QuizCard } from '@/components/QuizCard';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-12">
        <QuizCard />
      </main>
      <footer className="text-center py-6 text-muted-foreground text-sm">
        <p>Powered by <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PokéAPI</a></p>
      </footer>
    </div>
  );
};

export default Index;
