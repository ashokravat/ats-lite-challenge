import { useEffect, useState } from 'react';

export default function ShimmerLoading() {
    const [lines, setLines] = useState(2);

    useEffect(() => {
        const timer = setInterval(() => {
            setLines(Math.floor(Math.random() * 3) + 1);
        }, 1500);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col gap-2 w-full animate-pulse">
            {Array(lines).fill(0).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
                    style={{
                        width: `${Math.floor(Math.random() * 40) + 60}%`, 
                        opacity: 1 - (i * 0.2) 
                    }}
                />
            ))}
        </div>
    );
}