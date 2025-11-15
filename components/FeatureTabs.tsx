import React from 'react';
import { Feature } from '../types';

interface FeatureTabsProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
}

const features: Feature[] = ['Interpreter', 'Brutality Index', 'Grimoire', 'Archives'];

const FeatureTabs: React.FC<FeatureTabsProps> = ({ activeFeature, setActiveFeature }) => {
  return (
    <div className="flex justify-center border border-[var(--color-border)] bg-black/20 p-1">
      {features.map((feature) => (
        <button
          key={feature}
          onClick={() => setActiveFeature(feature)}
          className={`w-full py-3 px-1 sm:px-4 text-xs sm:text-sm md:text-base font-display tracking-wider transition-all duration-300 ease-in-out focus:outline-none relative ${
            activeFeature === feature
              ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-red-900/50'
              : 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
          }`}
        >
          {feature}
        </button>
      ))}
    </div>
  );
};

export default FeatureTabs;