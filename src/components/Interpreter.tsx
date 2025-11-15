import React, { useState, useCallback, DragEvent, useRef, useEffect } from 'react';
import { getInterpreterResponse, transcribeAudio } from '../services/geminiService';
import Loader from './Loader';
import { useTranscription } from '../hooks/useTranscription';
import ErrorDisplay from './ErrorDisplay';
import { SavedItem } from '../types';

const languages = [
    'Arabic', 'Chinese', 'Danish', 'Dutch', 'English', 'French', 'German', 'Hindi',
    'Indonesian', 'Italian', 'Japanese', 'Korean', 'Norwegian', 'Polish', 'Portuguese',
    'Russian', 'Spanish', 'Swedish', 'Turkish'
];

interface InterpreterProps {
    saveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
}

const LyricsResult: React.FC<{ content: string }> = ({ content }) => {
    return <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>;
};

const BreakdownResult: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/\n\s*\*\s*/);
    const intro = parts.shift()?.trim();

    const processLine = (line: string) => {
        let processedLine = line.replace(/^\s*(\d+\.|\*)\s*/, '');
        processedLine = processedLine.replace(/\*\*(.*?)\*\*:/g, '<strong class="font-bold text-gray-200 font-sans tracking-normal not-italic">$1</strong>:');
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-200 font-sans tracking-normal not-italic">$1</strong>');
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="text-gray-400 not-italic opacity-90">$1</em>');
        return { __html: processedLine };
    }
    
    return (
         <div className="space-y-6 font-serif text-lg leading-relaxed text-gray-300" style={{ fontFamily: 'Georgia, serif' }}>
            {intro && <p className="text-justify"><span className="float-left text-7xl font-display text-[var(--color-primary)] font-bold mr-3 mt-1 leading-[0.7]">{intro.charAt(0)}</span>{intro.substring(1)}</p>}
            
            <div className="space-y-8 clear-left">
                {parts.map((item, index) => {
                    if (!item.trim()) return null;
                    return (
                        <div key={index} className="flex items-start gap-4">
                            <div className="font-display text-5xl text-[var(--color-border)] leading-none mt-1">{`0${index + 1}`.slice(-2)}</div>
                            <div className="flex-1 text-base leading-relaxed text-gray-400 text-justify pt-1 border-t border-[var(--color-border)]" dangerouslySetInnerHTML={processLine(item.trim())} />
                        </div>
                    );
                })}
            </div>
        </div>
    )
};


const Interpreter: React.FC<InterpreterProps> = ({ saveItem }) => {
    const [text, setText] = useState('');
    const [sourceLang, setSourceLang] = useState('English');
    const [targetLang, setTargetLang] = useState('Spanish');
    const [result, setResult] = useState<{ brute: string; true: string; breakdown: string } | null>(null);
    const [error, setError] = useState('');
    const [detailedError, setDetailedError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    // Pre-populate with sample data to demonstrate the new "Breakdown" layout
    useEffect(() => {
        if (!result) {
            setText("Ich habe eine Idee, ich baue etwas auf. Ich grabe etwas aus.");
            setSourceLang('German');
            setTargetLang('English');
            setResult({
                brute: "I have an idea I build something up. I dig something out.",
                true: "I have an idea I'm building something. I'm unearthing something.",
                breakdown: `This isn't just a song; it's a manifesto for radical creation, a dark promise, and a total re-evaluation of what it means to build a world. The German is rich with specific, evocative imagery that gets lost in a literal rendering.
* **The Architect of the New World:** The speaker is a creator, oscillating between "building something up" and "digging something out." This isn't mere construction; it's an archaeological act of resurrection and re-purposing. They're not just creating *ex nihilo* but scavenging from the past, piecing together fragments.
* **"Ein Puzzle der Verlebten":** The brute force "lived-ones" is pathetic. "Verlebten" (from "verleben" - to spend/live through) refers to those who have *lived their lives* and are now gone, or the remnants of what they left behind. It's a "puzzle of the departed," or "what once was." The new world isn't pristine; it's assembled from the detritus and legacies of the past. And it needs to be "gut verkleben" — glued together well — implying a fragility to this new construction, a constant effort to hold it all in place.
* **"Bagger im Kerzenschein":** This is where the German truly shines and the literal translation utterly fails. An "excavator by candlelight" is a stunning juxtaposition. A massive, industrial, destructive machine operating in the intimate, fragile, almost ritualistic glow of a candle. It evokes clandestine work, a reverence for the destruction, or a delicate, precise hand guiding immense power.`
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onFinalTranscript = useCallback((transcript: string) => {
        setText(prev => `${prev} ${transcript}`.trim());
    }, []);

    const { isListening, startListening, stopListening, isSupported } = useTranscription(onFinalTranscript);

    const parseInterpreterResponse = (response: string) => {
        const upperResponse = response.toUpperCase();
        
        const headers = {
            brute: 'BRUTE FORCE',
            true: 'TRUE MEANING',
            breakdown: 'THE BREAKDOWN'
        };

        const findHeaderPos = (header: string): { start: number, end: number } | null => {
            const match = upperResponse.match(new RegExp(`(?:#+\\s*\\*?\\s*)?${header}(?:\\s*\\*?\\s*:?)`));
            if (!match || typeof match.index === 'undefined') {
                return null;
            }
            const start = match.index;
            const end = start + match[0].length;
            return { start, end };
        };

        const positions = [
            { name: 'brute', pos: findHeaderPos(headers.brute) },
            { name: 'true', pos: findHeaderPos(headers.true) },
            { name: 'breakdown', pos: findHeaderPos(headers.breakdown) },
        ].filter(p => p.pos !== null).sort((a, b) => a.pos!.start - b.pos!.start);

        if (positions.length < 3) {
            console.error("Failed to find all required headers in the response.", { positions, response });
            setError("The Interpreter's response was malformed. The signal is corrupt.");
            setDetailedError(`RAW RESPONSE:\n\n${response}`);
            return;
        }

        const parsedResult: { [key: string]: string } = {};
        for (let i = 0; i < positions.length; i++) {
            const current = positions[i];
            const next = positions[i + 1];
            const start = current.pos!.end;
            const end = next ? next.pos!.start : response.length;
            parsedResult[current.name] = response.substring(start, end).trim();
        }

        if (parsedResult.brute && parsedResult.true && parsedResult.breakdown) {
            setResult({
                brute: parsedResult.brute,
                true: parsedResult.true,
                breakdown: parsedResult.breakdown,
            });
        } else {
            console.error("Failed to parse response: one or more sections are empty.", { parsedResult, response });
            setError("The Interpreter's response was malformed. The signal is corrupt.");
            setDetailedError(`RAW RESPONSE:\n\n${response}`);
        }
    };

    const handleDeconstruct = async () => {
        if (!text || !sourceLang || !targetLang) {
            setError('All fields must be filled before deconstruction.');
            return;
        }
        setError('');
        setDetailedError('');
        setLoading(true);
        setResult(null);
        try {
            const response = await getInterpreterResponse(text, sourceLang, targetLang);
            if(response.startsWith("Error:")) {
                setError(response);
            } else {
                parseInterpreterResponse(response);
            }
        } catch (e: any) {
            setError(e.message);
            setDetailedError(e.stack || String(e));
        } finally {
            setLoading(false);
        }
    };
    
    const handleFile = async (file: File) => {
        if (!file.type.startsWith('audio/')) {
            setError("Invalid file type. Only audio files can be thrown into the chasm.");
            return;
        }
        setError('');
        setDetailedError('');
        setTranscribing(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            const base64Data = dataUrl.split(',')[1];
            try {
                const transcribedText = await transcribeAudio({ mimeType: file.type, data: base64Data });
                if (transcribedText.startsWith("Error:")) {
                    setError(transcribedText);
                } else {
                    setText(transcribedText);
                }
            } catch (err: any) {
                setError(err.message);
                setDetailedError(err.stack || String(err));
            } finally {
                setTranscribing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
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
                feature: 'Interpreter',
                input: { text, sourceLang, targetLang },
                result: result,
            });
        }
    };

    return (
        <div>
            <h2 className="font-display text-2xl sm:text-3xl text-center text-gray-200">The Interpreter</h2>
            <p className="text-center text-[var(--color-text-muted)] mt-2 text-sm italic">Deconstruct language. Reveal true meaning.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div 
                    className={`p-4 border-2 border-dashed transition-colors flex flex-col justify-center items-center h-48 md:h-auto ${isDragging ? 'border-[var(--color-secondary)] bg-black/50' : 'border-[var(--color-border)]'}`}
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                >
                    <div className="text-center text-[var(--color-text-muted)]">
                        {transcribing ? <Loader/> : <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <p className="font-bold text-gray-400">THE VOCAL CHASM</p>
                            <p className="text-xs">Drop an audio file here to transcribe</p>
                        </>}
                    </div>
                </div>

                <div className="relative h-48 md:h-auto">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Or enter phrase to deconstruct..."
                        className="w-full h-full p-3 resize-none"
                    />
                    {isSupported && (
                         <button onClick={isListening ? stopListening : startListening} title={isListening ? "Stop Listening" : "Start Live Transcription"}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${isListening ? 'bg-red-700 animate-pulse' : 'bg-gray-700 hover:bg-red-600'}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                             </svg>
                         </button>
                    )}
                 </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="w-full p-3">
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
                <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full p-3">
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
            </div>
            <button onClick={handleDeconstruct} disabled={loading || transcribing}
                className="btn w-full mt-4 py-3 text-lg bg-[var(--color-primary)]">
                {loading ? 'Deconstructing...' : 'Deconstruct'}
            </button>

            {loading && <Loader />}
            {error && <ErrorDisplay message={error} details={detailedError} />}
            
            <div ref={resultRef}>
            {result && (
                <div className="mt-8 animate-fade-in space-y-8">
                    {/* Comparison Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Brute Force Column */}
                        <div className="flex flex-col">
                            <h3 className="font-display text-xl text-[var(--color-primary)] tracking-widest">BRUTE FORCE</h3>
                            <div className="mt-2 p-4 sm:p-6 bg-black/40 border-l-4 border-[var(--color-primary)] text-gray-300 font-sans flex-1">
                                <LyricsResult content={result.brute} />
                            </div>
                        </div>
                        {/* True Meaning Column */}
                        <div className="flex flex-col">
                            <h3 className="font-display text-xl text-[var(--color-secondary)] tracking-widest">TRUE MEANING</h3>
                            <div className="mt-2 p-4 sm:p-6 bg-black/40 border-l-4 border-[var(--color-secondary)] text-gray-300 font-sans flex-1">
                                <LyricsResult content={result.true} />
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Card */}
                    <div className="mt-6">
                        <h3 className="font-display text-xl text-gray-200 tracking-widest">THE BREAKDOWN</h3>
                        <div className="mt-2 p-4 sm:p-6 bg-black/40 border-t-2 border-[var(--color-border)] text-gray-300 font-sans">
                           <BreakdownResult content={result.breakdown} />
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

export default Interpreter;