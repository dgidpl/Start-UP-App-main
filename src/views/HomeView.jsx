import { Lightbulb, Database, ChevronRight } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const CARDS = [
    {
        tab: 'submit',
        icon: Lightbulb,
        title: 'Маєш ідею?',
        text: 'Бажаєш покращити робочий процес, запропонувати технічне нововведення або змінити підхід до служби? Твій голос важливий.',
        cta: 'Подати ідею',
        wash: 'from-blue-500/8 to-purple-500/8',
        tile: 'bg-blue-500/20 text-blue-400',
        glow: 'rgba(59,130,246,0.35)',
        accent: 'text-blue-400',
    },
    {
        tab: 'bank',
        icon: Database,
        title: 'Підтримай колег',
        text: 'Переглядай банк ідей, голосуй за найкращі пропозиції та долучайся до обговорення в коментарях.',
        cta: 'Переглянути банк',
        wash: 'from-emerald-500/8 to-teal-500/8',
        tile: 'bg-emerald-500/20 text-emerald-400',
        glow: 'rgba(16,185,129,0.35)',
        accent: 'text-emerald-400',
    },
];

export default function HomeView({ onChangeTab }) {
    const rootRef = useScrollReveal([]);

    return (
        <div ref={rootRef} className="space-y-8 py-4">
            <section className="text-center space-y-4 py-8 sm:py-10">
                <div className="reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium mb-4 backdrop-blur-sm shadow-[0_0_20px_-6px_rgba(250,204,21,0.6)]">
                    <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                    Платформа інновацій НПУ
                </div>

                <h1
                    className="reveal font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] leading-[1.1]"
                    style={{ fontSize: 'clamp(2rem, 9vw, 3.75rem)', '--i': 1 }}
                >
                    Твоя ідея змінить <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-600 animate-gradient-drift">
                        Майбутнє Поліції
                    </span>
                </h1>

                <p
                    className="reveal text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
                    style={{ '--i': 2 }}
                >
                    Це простір для твоїх ініціатив. Пропонуй зміни, голосуй за найкращі рішення та допомагай розвивати Національну поліцію України.
                </p>
            </section>

            <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
                {CARDS.map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <button
                            key={c.tab}
                            type="button"
                            onClick={() => onChangeTab(c.tab)}
                            style={{ '--i': i + 3 }}
                            className="card-depth oneui-sheen reveal oneui-ring group relative text-left bg-slate-800/40 border border-white/5 p-6 sm:p-8 rounded-[var(--r-xl)] hover:bg-slate-800/60 hover:border-white/10 cursor-pointer"
                        >
                            <div className={`absolute inset-0 rounded-[var(--r-xl)] bg-gradient-to-br ${c.wash} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                            <div className="relative z-10">
                                <div className="relative w-14 h-14 mb-6">
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 rounded-2xl blur-xl animate-glow-pulse"
                                        style={{ background: c.glow, animationDelay: `${i * 0.8}s` }}
                                    />
                                    <div className={`relative w-14 h-14 ${c.tile} rounded-2xl flex items-center justify-center animate-float-soft`} style={{ animationDelay: `${i * 0.5}s` }}>
                                        <Icon size={28} />
                                    </div>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{c.title}</h2>
                                <p className="text-slate-400 mb-6 leading-relaxed text-sm sm:text-base">{c.text}</p>

                                <span className={`flex items-center gap-2 ${c.accent} font-bold group-hover:gap-3 transition-all duration-300`}>
                                    {c.cta} <ChevronRight size={18} />
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
