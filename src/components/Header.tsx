import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-4 border-b-2 border-t-2 border-[var(--color-border)] bg-black/20">
      <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-gray-200 tracking-wider">
        Scream<span className="text-[var(--color-primary)]">Tongue</span>
      </h1>
      <p className="text-[var(--color-text-muted)] mt-2 text-sm sm:text-base italic">The Linguistic Chronicler</p>
    </header>
  );
};

export default Header;