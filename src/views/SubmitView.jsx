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

// Спільні класи скляного поля вводу
const FIELD = `w-full bg-slate-900/50 backdrop-blur border border-white/10 rounded-[var(--r-md)] outline-none text-white placeholder-slate-600
    shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-300
    focus:border-yellow-400/40 focus:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35),0_0_0_3px_rgba(250,204,21,0.18)]`;

function Field({ label, icon: Icon, children }) {
    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-medium text-slate-300 ml-1 group-focus-within:text-yellow-400 transition-colors">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon
                        size={18}
                        className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-yellow-400 transition-colors pointer-events-none z-10"
                    />
                )}
                {children}
            </div>
        </div>
    );
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
            <div className="card-depth bg-slate-800/50 border border-white/10 rounded-[var(--r-xl)] p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative shrink-0">
                        <span aria-hidden="true" className="absolute inset-0 rounded-2xl bg-yellow-500/40 blur-xl animate-glow-pulse" />
                        <div className="relative p-3 bg-yellow-500/15 rounded-2xl text-yellow-400 animate-float-soft">
                            <Lightbulb size={32} />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Нова ідея</h2>
                        <p className="text-slate-400 text-sm">Детально опишіть вашу пропозицію</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Field label="Ваше ім'я (необов'язково)" icon={User}>
                        <input
                            type="text"
                            placeholder="Андрій Петренко"
                            className={`${FIELD} py-3 pl-11 pr-4`}
                            value={formData.author}
                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                        />
                    </Field>

                    <Field label="Телефон (необов'язково)" icon={Phone}>
                        <input
                            type="tel"
                            placeholder="+380-XX-XXX-XX-XX"
                            maxLength={17}
                            className={`${FIELD} py-3 pl-11 pr-4`}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        />
                    </Field>

                    <Field label="Тема ідеї *" icon={Tag}>
                        <input
                            type="text"
                            placeholder="Наприклад: Цифровізація, Безпека, Навчання..."
                            required
                            className={`${FIELD} py-3 pl-11 pr-4`}
                            value={formData.topic}
                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                        />
                    </Field>

                    <Field label="Опис ідеї *">
                        <textarea
                            rows="6"
                            placeholder="Я пропоную..."
                            required
                            className={`${FIELD} p-4 resize-none`}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        ></textarea>
                    </Field>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full overflow-hidden bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500
                            text-slate-900 font-bold py-4 rounded-[var(--r-md)] oneui-press oneui-ring
                            shadow-[0_6px_20px_-6px_rgba(250,204,21,0.7),inset_0_1px_0_rgba(255,255,255,0.45)]
                            flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {/* Спекулярний блік */}
                        <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none"
                        />
                        <span className="relative flex items-center gap-2">
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin" size={20} /> Відправляємо…</>
                            ) : (
                                <><Send size={20} /> Відправити ідею</>
                            )}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
