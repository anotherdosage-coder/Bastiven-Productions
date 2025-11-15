import React, { useState, useRef } from 'react';
import { getGrimoireResponse } from '../services/geminiService';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import { SavedItem } from '../types';

const ResultSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-4">
    <h4 className="font-display text-lg text-[var(--color-secondary)]">{title}:</h4>
    <p className="ml-4 mt-1 text-gray-300 whitespace-pre-wrap">{children}</p>
  </div>
);

interface GrimoireProps {
    saveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
}

const Grimoire: React.FC<GrimoireProps> = ({ saveItem }) => {
    const [term, setTerm] = useState('');
    const [result, setResult] = useState<{ def: string; origin: string; example: string } | null>(null);
    const [error, setError] = useState('');
    const [detailedError, setDetailedError] = useState('');
    const [loading, setLoading] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);


    const parseGrimoireResponse = (response: string) => {
        const def = response.match(/## Definition:([\s\S]*?)## Origin & Context:/);
        const origin = response.match(/## Origin & Context:([\s\S]*?)## Example:/);
        const example = response.match(/## Example:([\s\S]*)/);

        if (def && origin && example) {
            setResult({
                def: def[1].trim(),
                origin: origin[1].trim(),
                example: example[1].trim()
            });
        } else {
            setError("The Grimoire's response was unreadable. The script is obscured.");
            setDetailedError(`RAW RESPONSE:\n\n${response}`);
        }
    }

    const handleDefine = async () => {
        if (!term) {
            setError('Term cannot be empty.');
            return;
        }
        setError('');
        setDetailedError('');
        setLoading(true);
        setResult(null);
        try {
            const response = await getGrimoireResponse(term);
            if (response.startsWith("Error:")) {
                setError(response);
            } else {
                parseGrimoireResponse(response);
            }
        } catch (e: any) {
            setError(e.message);
            setDetailedError(e.stack || String(e));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (resultRef.current) {
            const printable = resultRef.current.cloneNode(true) as HTMLElement;
            printable.classList.add('printable');
            document.body.appendChild(printable);
            window.print();
            document.body.removeChild(printable);
        }
    };

    const handleSave = () => {
        if (result) {
            saveItem({
                feature: 'Grimoire',
                input: { term },
                result: result,
            });
        }
    };


    return (
        <div>
            <h2 className="font-display text-2xl sm:text-3xl text-center text-gray-200">The Grimoire</h2>
            <p className="text-center text-[var(--color-text-muted)] mt-2 text-sm italic">A chronicle of subculture, slang, and lyrical metaphor.</p>

            <div className="mt-6">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Enter term to define... (e.g., 'roadman')"
                        className="flex-grow p-3"
                        onKeyDown={(e) => e.key === 'Enter' && handleDefine()}
                    />
                    <button onClick={handleDefine} disabled={loading}
                        className="btn w-full sm:w-auto px-8 py-3 text-lg bg-[var(--color-secondary)] text-black border-[var(--color-secondary)] hover:text-[var(--color-secondary)]">
                        {loading ? 'Consulting...' : 'Define'}
                    </button>
                </div>
            </div>

            {loading && <Loader />}
            {error && <ErrorDisplay message={error} details={detailedError} />}

            <div ref={resultRef}>
            {result && (
                <div className="mt-8 animate-fade-in">
                    <div className="p-6 bg-black/30 border border-[var(--color-border)]">
                        <h3 className="text-2xl font-bold text-gray-100 font-display tracking-wide">{term}</h3>
                        <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                        <ResultSection title="Definition">{result.def}</ResultSection>
                        <ResultSection title="Origin & Context">{result.origin}</ResultSection>
                        <ResultSection title="Example"><span className="italic">"{result.example}"</span></ResultSection>
                        </div>
                    </div>
                     {/* Save Actions */}
                    <div className="flex justify-end gap-2 mt-4 no-print">
                        <button onClick={handleSave} className="btn-secondary">Save to Archives</button>
                        <button onClick={handlePrint} className="btn-secondary">Save as PDF</button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default Grimoire;