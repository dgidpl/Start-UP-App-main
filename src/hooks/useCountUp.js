import { useEffect, useRef, useState } from 'react';

const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

/**
 * rAF-лічильник від 0 до `value`. Поважає prefers-reduced-motion.
 */
export default function useCountUp(value, duration = 900) {
    const [display, setDisplay] = useState(value);
    const frameRef = useRef(0);
    const fromRef = useRef(0);

    useEffect(() => {
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
            setDisplay(value);
            return;
        }

        const from = fromRef.current;
        const delta = value - from;
        if (delta === 0) return;

        const start = performance.now();

        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            setDisplay(Math.round(from + delta * easeOutQuint(t)));
            if (t < 1) {
                frameRef.current = requestAnimationFrame(tick);
            } else {
                fromRef.current = value;
            }
        };

        frameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value, duration]);

    return display;
}
