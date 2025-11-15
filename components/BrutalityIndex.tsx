import React, { useState, useRef } from 'react';
import { getBrutalityIndex, getSpeech } from '../services/geminiService';
import { BrutalityIndexResponse, SavedItem } from '../types';
import Loader from './Loader';
import BrutalityVisualizer from './BrutalityVisualizer';
import ErrorDisplay from './ErrorDisplay';

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

interface BrutalityIndexProps {
    saveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
}

const BrutalityIndex: React.FC<BrutalityIndexProps> = ({ saveItem }) => {
    const [text, setText] = useState('');
    const [result, setResult] = useState<BrutalityIndexResponse | null>(null);
    const [error, setError] = useState('');
    const [detailedError, setDetailedError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleAnalyze = async () => {
        if (!text) {
            setError('Input text cannot be empty.');
            return;
        }
        setError('');
        setDetailedError('');
        setLoading(true);
        setResult(null);
        try {
            const responseStr = await getBrutalityIndex(text);
            const parsed = JSON.parse(responseStr);
            if (parsed.error) {
              setError(parsed.error)
            } else {
              setResult(parsed);
            }

        } catch (e: any) {
            setError("Failed to parse the Brutality Index. The response was static noise.");
            setDetailedError(e.stack || String(e));
        } finally {
            setLoading(false);
        }
    };
    
    const handlePronounce = async () => {
        if (!result || isSpeaking) return;

        setIsSpeaking(true);
        try {
            const textToSpeak = `Brutality score: ${result.score} out of 10. Label: ${result.label}. Analysis: ${result.analysis}`;
            const base64Audio = await getSpeech(textToSpeak);
            if (base64Audio) {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const audioContext = audioContextRef.current;
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
                source.onended = () => {
                    setIsSpeaking(false);
                };
            } else {
                setError("Could not generate audio for pronunciation.");
                setDetailedError('');
                setIsSpeaking(false);
            }
        } catch (e: any) {
            console.error(e);
            setError("An error occurred during audio playback.");
            setDetailedError(e.stack || String(e));
            setIsSpeaking(false);
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
                feature: 'Brutality Index',
                input: { text },
                result: result,
            });
        }
    };

    return (
        <div>
            <h2 className="font-display text-2xl sm:text-3xl text-center text-gray-200">The Brutality Index</h2>
            <p className="text-center text-[var(--color-text-muted)] mt-2 text-sm italic">Gauge the emotional intensity. From static to mosh pit.</p>
            
            <div className="mt-6 space-y-4">
                 <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to analyze..."
                        className="w-full h-40 p-3 resize-none"
                    />
                 </div>
                <button onClick={handleAnalyze} disabled={loading}
                    className="btn w-full py-3 text-lg">
                    {loading ? 'Analyzing...' : 'Analyze'}
                </button>
            </div>

            {loading && <Loader />}
            {error && <ErrorDisplay message={error} details={detailedError} />}

            <div ref={resultRef}>
            {result && (
                <div className="mt-8 animate-fade-in">
                    <div className="p-6 bg-black/30 border border-[var(--color-border)]">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4">
                                <p className="font-display text-5xl text-[var(--color-secondary)]">{result.score}/10</p>
                                <button 
                                    onClick={handlePronounce} 
                                    disabled={isSpeaking}
                                    title="Pronounce analysis"
                                    className="p-3 bg-gray-700/50 rounded-full text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed no-print"
                                >
                                    {isSpeaking ? (
                                        <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 15.536a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728M12 12h.01" /></svg>
                                    )}
                                </button>
                            </div>
                            <p className="font-display text-3xl text-[var(--color-primary)] tracking-widest mt-2">{result.label}</p>
                        </div>
                        <div className="mt-6">
                        <BrutalityVisualizer score={result.score} />
                        </div>
                        <p className="mt-6 text-center text-lg text-gray-300 italic">"{result.analysis}"</p>
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

export default BrutalityIndex;