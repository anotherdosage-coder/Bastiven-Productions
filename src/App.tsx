import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FeatureTabs from './components/FeatureTabs';
import Interpreter from './components/Interpreter';
import BrutalityIndex from './components/BrutalityIndex';
import Grimoire from './components/Grimoire';
import Archives from './components/Archives';
import { Feature, SavedItem } from './types';

const FeatureCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] p-6 text-center transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-black/20 group">
    <div className="text-[var(--color-secondary)] w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{children}</div>
    <h3 className="font-display text-2xl text-gray-200">{title}</h3>
    <p className="mt-2 text-[var(--color-text-muted)] text-sm">{description}</p>
  </div>
);

const CoverPage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center overflow-hidden">
        <header className="animate-fade-in">
            <h1 className="font-display text-7xl sm:text-8xl md:text-9xl text-gray-200 tracking-wider slide-in-text">
                <span><span>S</span></span><span><span>C</span></span><span><span>R</span></span><span><span>E</span></span><span><span>A</span></span><span><span>M</span></span><span className="text-[var(--color-primary)]"><span>T</span></span><span className="text-[var(--color-primary)]"><span>O</span></span><span className="text-[var(--color-primary)]"><span>N</span></span><span className="text-[var(--color-primary)]"><span>G</span></span><span className="text-[var(--color-primary)]"><span>U</span></span><span className="text-[var(--color-primary)]"><span>E</span></span>
            </h1>
            <p className="text-[var(--color-text-muted)] mt-4 text-lg sm:text-xl font-bold italic animate-fade-in" style={{ animationDelay: '0.3s' }} >Language is a weapon. It's time to deconstruct it.</p>
        </header>

        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 my-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <FeatureCard title="The Interpreter" description="Contextual, not literal. Uncover the cultural nuance and subtext lost in brute-force translation.">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9h18" /></svg>
            </FeatureCard>
            <FeatureCard title="The Brutality Index" description="A visceral take on sentiment analysis. Rate text on a scale from 'Static' to 'Mosh Pit'.">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </FeatureCard>
            <FeatureCard title="The Grimoire" description="A chronicle of global slang, lyrical metaphors, and technical jargon. Decode the lexicon of the underground.">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </FeatureCard>
        </div>

        <button onClick={onEnter} className="btn text-2xl py-4 px-12 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            Enter the Chasm
        </button>
    </div>
);


const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>('Interpreter');
  const [showCover, setShowCover] = useState(true);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('screamTongueArchives');
      if (stored) {
        setSavedItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load archives from localStorage", error);
    }
  }, []);
  
  const saveItem = (item: Omit<SavedItem, 'id' | 'timestamp'>) => {
    const newItem: SavedItem = {
      ...item,
      id: new Date().toISOString() + Math.random(),
      timestamp: new Date().toLocaleString()
    };
    const updatedItems = [newItem, ...savedItems];
    setSavedItems(updatedItems);
    localStorage.setItem('screamTongueArchives', JSON.stringify(updatedItems));
  };

  const deleteItem = (id: string) => {
    const updatedItems = savedItems.filter(item => item.id !== id);
    setSavedItems(updatedItems);
    localStorage.setItem('screamTongueArchives', JSON.stringify(updatedItems));
  };

  const clearArchives = () => {
    setSavedItems([]);
    localStorage.removeItem('screamTongueArchives');
  }

  const renderFeature = () => {
    switch (activeFeature) {
      case 'Interpreter':
        return <Interpreter saveItem={saveItem} />;
      case 'Brutality Index':
        return <BrutalityIndex saveItem={saveItem} />;
      case 'Grimoire':
        return <Grimoire saveItem={saveItem} />;
      case 'Archives':
        return <Archives savedItems={savedItems} deleteItem={deleteItem} clearAll={clearArchives} />;
      default:
        return <Interpreter saveItem={saveItem} />;
    }
  };

  if (showCover) {
    return <CoverPage onEnter={() => setShowCover(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          <FeatureTabs activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
          <div className="mt-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 sm:p-6 shadow-lg shadow-black/50">
            {renderFeature()}
          </div>
        </main>
      </div>
      <footer className="w-full max-w-4xl mx-auto text-center py-4 mt-8 text-xs text-[var(--color-text-muted)]">
        <p>ScreamTongue &copy; {new Date().getFullYear()}. Deconstruct. Understand. Dominate.</p>
      </footer>
    </div>
  );
};

export default App;