import { useState } from 'react';
import { Lightbulb, User, Phone, Send, Loader2, Tag } from 'lucide-react';
import * as api from '../services/api';

function formatPhone(value) {
    const digits = value.replace(/\D/g, '');
    // Якщо починається з 380 — формат +380-XX-XXX-XX-XX
    let d = digits;
    if (d.startsWith('380')) d = d; // already fine
    else if (d.startsWith('0')) d = '38' + d; // 0XX → 380XX

    let result = '';
    if (d.length > 0) result += '+' + d.slice(0, 3);   // +380
    if (d.length > 3) result += '-' + d.slice(3, 5);    // -66
    if (d.length > 5) result += '-' + d.slice(5, 8);    // -322
    if (d.length > 8) result += '-' + d.slice(8, 10);   // -41
    if (d.length > 10) result += '-' + d.slice(10, 12);  // -85
    return result;
}

export default function SubmitView({ showNotify, onChangeTab, refreshIdeas }) {
    const [formData, setFormData] = useState({ author: '', phone: '', topic: '', content: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content.trim()) {
            return showNotify("Опишіть вашу ідею!", "error");
        }


        setIsSubmitting(true);
        try {
            const result = await api.createIdea(formData);
            if (result.status === 'success') {
                showNotify("Ідею успішно додано!");
                setFormData({ author: '', phone: '', topic: '', content: '' });
                if (refreshIdeas) refreshIdeas();
                setTimeout(() => onChangeTab('bank'), 1000);
            } else {
                showNotify(result.message || "Помилка збереження", "error");
            }
        } catch (error) {
            console.error(error);
            showNotify("Помилка відправки. Спробуйте пізніше.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="card-depth glass-edge bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                        <Lightbulb size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Нова ідея</h2>
                        <p className="text-slate-400 text-sm">Детально опишіть вашу пропозицію</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Ваше ім'я (необов'язково)</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Андрій Петренко"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all outline-none text-white placeholder-slate-600"
                                value={formData.author}
                                onChange={e => setFormData({ ...formData, author: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Телефон (необов'язково)</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-slate-500" size={18} />
                            <input
                                type="tel"
                                placeholder="+380-XX-XXX-XX-XX"
                                maxLength={17}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all outline-none text-white placeholder-slate-600"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Тема ідеї *</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-3.5 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Наприклад: Цифровізація, Безпека, Навчання..."
                                required
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all outline-none text-white placeholder-slate-600"
                                value={formData.topic}
                                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Опис ідеї *</label>
                        <textarea
                            rows="6"
                            placeholder="Я пропоную..."
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all outline-none text-white placeholder-slate-600 resize-none"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <><Send size={20} /> Відправити ідею</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
