import React from 'react';

const BrutalityVisualizer: React.FC<{ score: number }> = ({ score }) => {
    const numBars = 32;
    const bars = Array.from({ length: numBars });

    // Base color: secondary, transitions to primary at high scores
    const primaryRGB = [200, 0, 57]; // approx --color-primary
    const secondaryRGB = [255, 195, 0]; // approx --color-secondary
    
    const ratio = Math.max(0, (score - 3) / 7); // from score 3-10, ratio goes 0-1
    const r = Math.round(secondaryRGB[0] * (1 - ratio) + primaryRGB[0] * ratio);
    const g = Math.round(secondaryRGB[1] * (1 - ratio) + primaryRGB[1] * ratio);
    const b = Math.round(secondaryRGB[2] * (1 - ratio) + primaryRGB[2] * ratio);

    const color = `rgb(${r}, ${g}, ${b})`;

    return (
        <>
            <div className="flex justify-center items-end gap-1 h-24 w-full">
                {bars.map((_, i) => {
                    const sinWave = Math.sin((i / numBars) * Math.PI * 2 + (score / 5));
                    const randomFactor = Math.random() * 0.4 + 0.8; 
                    const heightMultiplier = (sinWave + 1) / 2 * randomFactor;
                    
                    const height = Math.min(100, (score / 10) * heightMultiplier * 100);
                    const animationDuration = (Math.random() * (11 - score) * 0.08 + 0.2).toFixed(2);
                    const animationDelay = (i * 0.02).toFixed(2);

                    return (
                        <div
                            key={i}
                            className="w-full bg-current rounded-t-sm"
                            style={{
                                backgroundColor: color,
                                height: `${Math.max(5, height)}%`,
                                animation: `visualizer-pulse ${animationDuration}s ease-in-out ${animationDelay}s infinite alternate`,
                            }}
                        />
                    );
                })}
            </div>
            <style>
                {`
                @keyframes visualizer-pulse {
                    from { transform: scaleY(0.3); opacity: 0.7; }
                    to { transform: scaleY(1); opacity: 1; }
                }
                `}
            </style>
        </>
    );
};

export default BrutalityVisualizer;