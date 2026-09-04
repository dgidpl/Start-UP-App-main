import { useEffect, useRef } from 'react';

/**
 * Сходинкова поява елементів при потраплянні у в'юпорт.
 * Вішає клас `in` на кожен нащадок із класом `.reveal` і відписується після спрацювання.
 *
 * @param {any[]} deps — перезапустити спостереження при зміні списку (пагінація, фільтр)
 * @returns ref для контейнера
 */
export default function useScrollReveal(deps = []) {
    const containerRef = useRef(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const targets = root.querySelectorAll('.reveal:not(.in)');
        if (targets.length === 0) return;

        // Без анімацій — одразу показуємо
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduced || typeof IntersectionObserver === 'undefined') {
            targets.forEach(el => el.classList.add('in'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        targets.forEach(el => observer.observe(el));
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return containerRef;
}
