import { useLayoutEffect, useRef, useState } from 'react';
import { Home, Lightbulb, Database, Phone } from 'lucide-react';
import Logo from './Logo';

const tabs = [
    { id: 'home', icon: Home, label: 'Головна' },
    { id: 'submit', icon: Lightbulb, label: 'Подати ідею' },
    { id: 'bank', icon: Database, label: 'Банк ідей' },
    { id: 'contacts', icon: Phone, label: 'Контакти' },
];

const tabLabels = {
    home: 'Головна',
    submit: 'Нова ідея',
    bank: 'Банк ідей',
    contacts: 'Контакти',
};

export default function Header({ activeTab, onTabChange }) {
    const navRef = useRef(null);
    const itemRefs = useRef({});
    const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

    // Плавний переїзд підсвітки активного пункту
    useLayoutEffect(() => {
        const el = itemRefs.current[activeTab];
        const nav = navRef.current;
        if (!el || !nav) return;

        const move = () => {
            const navBox = nav.getBoundingClientRect();
            const box = el.getBoundingClientRect();
            setPill({ left: box.left - navBox.left, width: box.width, ready: true });
        };

        move();
        window.addEventListener('resize', move);
        return () => window.removeEventListener('resize', move);
    }, [activeTab]);

    return (
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/60 saturate-150">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
                <button
                    type="button"
                    className="flex items-center gap-3 shrink-0 oneui-press oneui-ring rounded-xl"
                    onClick={() => onTabChange('home')}
                    aria-label="На головну"
                >
                    <Logo />
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                        Start-UP
                    </span>
                </button>

                <nav ref={navRef} className="hidden md:flex gap-2 relative">
                    {/* Рухома підсвітка активного пункту */}
                    <span
                        aria-hidden="true"
                        className="absolute top-0 bottom-0 rounded-xl bg-white/[0.07] border border-yellow-400/20 shadow-[0_0_18px_rgba(250,204,21,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] pointer-events-none"
                        style={{
                            left: pill.left,
                            width: pill.width,
                            opacity: pill.ready ? 1 : 0,
                            transition: 'left 0.4s var(--ease-oneui), width 0.4s var(--ease-oneui), opacity 0.3s ease',
                        }}
                    />
                    {tabs.map(({ id, icon: Icon, label }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                ref={el => { itemRefs.current[id] = el; }}
                                onClick={() => onTabChange(id)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium oneui-press oneui-ring whitespace-nowrap
                                    ${isActive ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Icon size={18} className={isActive ? 'stroke-[2.5px] drop-shadow-glow' : ''} />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="md:hidden text-sm font-medium text-slate-400 truncate max-w-[45vw] text-right">
                    {tabLabels[activeTab] || 'Головна'}
                </div>
            </div>

            {/* Hairline замість суцільного бордера */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
        </header>
    );
}
