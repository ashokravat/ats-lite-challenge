import { useState, useEffect } from 'react';

interface TypewriterProps {
    content: string;
    speed?: number;
    onComplete?: () => void;
    skipAnimation?: boolean;
}

export default function Typewriter({
    content,
    speed = 30,
    onComplete,
    skipAnimation = false
}: TypewriterProps) {
    const [displayedContent, setDisplayedContent] = useState(skipAnimation ? content : '');
    const [currentIndex, setCurrentIndex] = useState(skipAnimation ? content.length : 0);
    const [isComplete, setIsComplete] = useState(skipAnimation);

    useEffect(() => {
        if (skipAnimation) {
            setDisplayedContent(content);
            setCurrentIndex(content.length);
            setIsComplete(true);
            if (onComplete) onComplete();
            return;
        }

        //reset
        setDisplayedContent('');
        setCurrentIndex(0);
        setIsComplete(false);
    }, [content, skipAnimation, onComplete]);

    useEffect(() => {
        if (skipAnimation) return;

        if (currentIndex < content.length) {
            const timeout = setTimeout(() => {
                setDisplayedContent(prev => prev + content[currentIndex]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (currentIndex === content.length && !isComplete) {
            setIsComplete(true);
            if (onComplete) onComplete();
        }
    }, [currentIndex, content, speed, isComplete, skipAnimation, onComplete]);

    return (
        <p>
            {displayedContent}
            {!isComplete && <span className="animate-pulse">|</span>}
        </p>
    );
}