import { Phone, Globe, MessageSquare, ChevronRight } from 'lucide-react';

export default function ContactsView() {
    return (
        <div className="max-w-md mx-auto py-10">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
                    <Phone size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white">Зв'яжіться з нами</h2>
                <p className="text-slate-400 mt-2">Долучайтеся до нашої спільноти</p>
            </div>

            <div className="card-depth glass-edge bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 space-y-6">
                    <a href="https://dgidpl.com.ua/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group hover:bg-white/5 p-3 rounded-xl transition-all">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <Globe size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Наш сайт</p>
                            <p className="text-white group-hover:text-blue-400 transition-colors">dgidpl.com.ua</p>
                        </div>
                        <div className="text-slate-600 group-hover:text-white"><ChevronRight size={16} /></div>
                    </a>

                    <a href="https://chat.whatsapp.com/JXmbaeRhsL83qLeYUwjkp0?mode=gi_t" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group hover:bg-white/5 p-3 rounded-xl transition-all">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                            <MessageSquare size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Комунікативна група</p>
                            <p className="text-white group-hover:text-green-400 transition-colors">WhatsApp Community</p>
                        </div>
                        <div className="text-slate-600 group-hover:text-white"><ChevronRight size={16} /></div>
                    </a>
                </div>

                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500"></div>
            </div>
        </div>
    );
}
