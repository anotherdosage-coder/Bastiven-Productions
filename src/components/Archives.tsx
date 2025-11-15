import React, { useState } from 'react';
import { SavedItem } from '../types';

interface ArchivesProps {
  savedItems: SavedItem[];
  deleteItem: (id: string) => void;
  clearAll: () => void;
}

const ArchiveResult: React.FC<{ item: SavedItem }> = ({ item }) => {
    switch(item.feature) {
        case 'Interpreter':
            return (
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-display text-sm text-[var(--color-primary)]">BRUTE FORCE</h4>
                        <p className="pl-2 border-l-2 border-[var(--color-primary)] text-gray-400 whitespace-pre-wrap">{item.result.brute}</p>
                    </div>
                    <div>
                        <h4 className="font-display text-sm text-[var(--color-secondary)]">TRUE MEANING</h4>
                        <p className="pl-2 border-l-2 border-[var(--color-secondary)] text-gray-400 whitespace-pre-wrap">{item.result.true}</p>
                    </div>
                     <div>
                        <h4 className="font-display text-sm text-gray-300">THE BREAKDOWN</h4>
                        <p className="pl-2 border-l-2 border-gray-500 text-gray-400 whitespace-pre-wrap">{item.result.breakdown}</p>
                    </div>
                </div>
            );
        case 'Brutality Index':
             return (
                <div className="space-y-2 text-sm">
                    <p><strong className="text-gray-300">Score:</strong> <span className="font-display text-xl text-[var(--color-secondary)]">{item.result.score}/10</span></p>
                    <p><strong className="text-gray-300">Label:</strong> <span className="font-display text-xl text-[var(--color-primary)]">{item.result.label}</span></p>
                    <p><strong className="text-gray-300">Analysis:</strong> <span className="italic text-gray-400">"{item.result.analysis}"</span></p>
                </div>
            );
        case 'Grimoire':
            return (
                 <div className="space-y-2 text-sm">
                    <p><strong className="text-gray-300">Definition:</strong> <span className="text-gray-400">{item.result.def}</span></p>
                    <p><strong className="text-gray-300">Origin & Context:</strong> <span className="text-gray-400">{item.result.origin}</span></p>
                    <p><strong className="text-gray-300">Example:</strong> <span className="italic text-gray-400">"{item.result.example}"</span></p>
                </div>
            );
        default:
            return <p>Cannot display archived item.</p>
    }
}

const Archives: React.FC<ArchivesProps> = ({ savedItems, deleteItem, clearAll }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const getInputDisplay = (item: SavedItem) => {
        switch(item.feature) {
            case 'Interpreter':
                return `"${item.input.text}" (${item.input.sourceLang} -> ${item.input.targetLang})`;
            case 'Brutality Index':
                return `"${item.input.text}"`;
            case 'Grimoire':
                return `"${item.input.term}"`;
            default:
                return 'Unknown Input';
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="font-display text-2xl sm:text-3xl text-gray-200">The Archives</h2>
                    <p className="text-[var(--color-text-muted)] mt-2 text-sm italic">A record of your linguistic deconstructions.</p>
                </div>
                 {savedItems.length > 0 && (
                    <button onClick={clearAll} className="btn-secondary border-red-700 text-red-400 hover:bg-red-900/50 hover:text-red-300 hover:border-red-500">
                        Clear All
                    </button>
                 )}
            </div>

            <div className="mt-6 space-y-2">
                {savedItems.length > 0 ? (
                    savedItems.map(item => (
                        <div key={item.id} className="bg-black/30 border border-[var(--color-border)]">
                            <button onClick={() => setActiveId(activeId === item.id ? null : item.id)} className="w-full p-3 text-left flex justify-between items-center hover:bg-white/5 transition-colors">
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-gray-200 truncate">{item.feature}: <span className="font-normal text-gray-400 italic">{getInputDisplay(item)}</span></p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{item.timestamp}</p>
                                </div>
                                <div className="flex items-center pl-2">
                                    <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-2 text-gray-500 hover:text-[var(--color-primary)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transition-transform ${activeId === item.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </button>
                            {activeId === item.id && (
                                <div className="p-4 border-t border-[var(--color-border)] bg-black/20">
                                    <ArchiveResult item={item} />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)]">
                        <p>The Archives are empty.</p>
                        <p className="text-sm">Results from other features can be saved here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Archives;