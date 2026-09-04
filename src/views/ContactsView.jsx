import { Phone, Globe, MessageSquare, ChevronRight } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const LINKS = [
    {
        href: 'https://dgidpl.com.ua/',
        icon: Globe,
        kicker: 'Наш сайт',
        title: 'dgidpl.com.ua',
        tile: 'bg-blue-500/15 text-blue-400',
        glow: 'rgba(59,130,246,0.4)',
        hover: 'group-hover:text-blue-400',
    },
    {
        href: 'https://chat.whatsapp.com/JXmbaeRhsL83qLeYUwjkp0?mode=gi_t',
        icon: MessageSquare,
        kicker: 'Комунікативна група',
        title: 'WhatsApp Community',
        tile: 'bg-green-500/15 text-green-400',
        glow: 'rgba(34,197,94,0.4)',
        hover: 'group-hover:text-green-400',
    },
];

export default function ContactsView() {
    const rootRef = useScrollReveal([]);

    return (
        <div ref={rootRef} className="max-w-md mx-auto py-8 sm:py-10">
            <div className="text-center mb-8 reveal">
                <div className="relative w-20 h-20 mx-auto mb-4">
                    <span aria-hidden="true" className="absolute inset-0 rounded-full bg-yellow-500/40 blur-2xl animate-glow-pulse" />
                    <div className="relative w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 animate-float-soft">
                        <Phone size={40} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white">Зв'яжіться з нами</h2>
                <p className="text-slate-400 mt-2">Долучайтеся до нашої спільноти</p>
            </div>

            <div
                className="card-depth reveal bg-slate-800/40 border border-white/5 rounded-[var(--r-xl)] overflow-hidden"
                style={{ '--i': 1 }}
            >
                <div className="p-4 sm:p-6 space-y-3">
                    {LINKS.map(l => {
                        const Icon = l.icon;
                        return (
                            <a
                                key={l.href}
                                href={l.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 group hover:bg-white/5 p-3 rounded-[var(--r-md)] border border-transparent hover:border-white/10 oneui-press oneui-ring"
                            >
                                <div className="relative w-10 h-10 shrink-0">
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: l.glow }}
                                    />
                                    <div className={`relative w-10 h-10 rounded-full ${l.tile} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold truncate">{l.kicker}</p>
                                    <p className={`text-white transition-colors truncate ${l.hover}`}>{l.title}</p>
                                </div>
                                <div className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0">
                                    <ChevronRight size={16} />
                                </div>
                            </a>
                        );
                    })}
                </div>

                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 animate-gradient-drift"></div>
            </div>
        </div>
    );
}
