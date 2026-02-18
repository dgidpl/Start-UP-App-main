import { Lightbulb, Database, ChevronRight } from 'lucide-react';

export default function HomeView({ onChangeTab }) {
    return (
        <div className="space-y-8 py-4">
            <section className="text-center space-y-4 py-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium mb-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                    Платформа інновацій НПУ
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                    Твоя ідея змінить <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                        Майбутнє Поліції
                    </span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Це простір для твоїх ініціатив. Пропонуй зміни, голосуй за найкращі рішення та допомагай розвивати Національну поліцію України.
                </p>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
                <div onClick={() => onChangeTab('submit')} className="card-depth glass-edge group relative bg-slate-800/40 border border-white/5 p-8 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                        <Lightbulb size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Маєш ідею?</h2>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                        Бажаєш покращити робочий процес, запропонувати технічне нововведення або змінити підхід до служби? Твій голос важливий.
                    </p>
                    <span className="flex items-center gap-2 text-blue-400 font-bold group-hover:gap-3 transition-all">
                        Подати ідею <ChevronRight size={18} />
                    </span>
                </div>

                <div onClick={() => onChangeTab('bank')} className="card-depth glass-edge group relative bg-slate-800/40 border border-white/5 p-8 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                        <Database size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Підтримай колег</h2>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                        Переглядай банк ідей, голосуй за найкращі пропозиції та долучайся до обговорення в коментарях.
                    </p>
                    <span className="flex items-center gap-2 text-emerald-400 font-bold group-hover:gap-3 transition-all">
                        Переглянути банк <ChevronRight size={18} />
                    </span>
                </div>
            </div>
        </div>
    );
}
