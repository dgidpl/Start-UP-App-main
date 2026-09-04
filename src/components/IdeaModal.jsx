import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Loader2, Send } from 'lucide-react';
import * as api from '../services/api';

export default function IdeaModal({ idea, onClose, showNotify }) {
    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [authorName, setAuthorName] = useState(() => localStorage.getItem('npu_nickname') || '');
    const [isPosting, setIsPosting] = useState(false);

    // Завантаження коментарів
    useEffect(() => {
        const load = async () => {
            setIsLoadingComments(true);
            try {
                const data = await api.getComments(idea.id);
                setComments(data);
            } catch (e) {
                console.error("Failed to load comments", e);
            } finally {
                setIsLoadingComments(false);
            }
        };
        load();
    }, [idea.id]);

    // Закриття по Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Блокуємо скрол сторінки під модалкою
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    const handlePostComment = async () => {
        if (!commentText.trim() || !authorName.trim()) {
            showNotify("Введіть ім'я та коментар", "error");
            return;
        }

        localStorage.setItem('npu_nickname', authorName);
        setIsPosting(true);

        const newComment = {
            author: authorName,
            text: commentText,
            date: new Date().toISOString()
        };

        // Оптимістичне оновлення
        setComments(prev => [...prev, newComment]);
        setCommentText('');

        try {
            await api.addComment(idea.id, newComment.author, newComment.text);
        } catch (e) {
            showNotify("Помилка відправки коментаря", "error");
        } finally {
            setIsPosting(false);
        }
    };

    const inputClass = `w-full bg-slate-950/60 border border-white/10 rounded-[var(--r-sm)] px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none
        transition-all duration-300 focus:border-yellow-400/40 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]`;

    return createPortal(
        <div
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="w-full sm:max-w-lg bg-slate-900/95 backdrop-blur-2xl saturate-150 border border-white/10 sm:border-white/10
                    rounded-t-[var(--r-xl)] sm:rounded-[var(--r-xl)] p-5 sm:p-6 flex flex-col
                    max-h-[min(90dvh,calc(100dvh-1.5rem))] animate-sheet-up sm:animate-pop-in
                    shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.7),0_24px_60px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Ручка bottom-sheet — тільки на мобільному */}
                <div aria-hidden="true" className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-4 shrink-0"></div>

                {/* Заголовок */}
                <div className="flex justify-between items-start gap-3 mb-4 shrink-0">
                    <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-white min-w-0">
                        Ідея <span className="font-mono text-slate-400">#{idea.id}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 shrink-0 hover:bg-white/10 rounded-full text-slate-400 hover:text-white oneui-press oneui-ring"
                        aria-label="Закрити"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Контент ідеї */}
                <div className="bg-slate-800/50 border border-white/5 rounded-[var(--r-md)] p-4 mb-5 text-slate-300 leading-relaxed overflow-y-auto shrink-0 max-h-[30vh] shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                    {idea.content}
                </div>

                {/* Коментарі */}
                <div className="flex flex-col grow min-h-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2 shrink-0">
                        <MessageSquare size={14} /> Обговорення
                    </h3>

                    <div className="grow overflow-y-auto space-y-2.5 mb-4 pr-1">
                        {isLoadingComments ? (
                            <div className="text-center py-4 text-slate-500"><Loader2 className="animate-spin mx-auto" /></div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-6 text-slate-600 text-sm">Коментарів ще немає. Будьте першим!</div>
                        ) : (
                            comments.map((c, idx) => (
                                <div
                                    key={idx}
                                    style={{ '--i': Math.min(idx, 8) }}
                                    className="reveal in bg-slate-950/50 border border-white/5 p-3 rounded-[var(--r-sm)] text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                >
                                    <div className="flex justify-between items-center gap-2 mb-1">
                                        <span className="font-bold text-blue-400 truncate">{c.author}</span>
                                        <span className="text-xs text-slate-600 shrink-0">{new Date(c.date).toLocaleDateString('uk-UA')}</span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed">{c.text}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Форма коментаря */}
                    <div className="space-y-3 pt-3 border-t border-white/10 mt-auto shrink-0 pb-[env(safe-area-inset-bottom)]">
                        <input
                            type="text"
                            placeholder="Ваш нікнейм"
                            className={inputClass}
                            value={authorName}
                            onChange={e => setAuthorName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ваш коментар..."
                                className={`${inputClass} flex-1 min-w-0`}
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                            />
                            <button
                                onClick={handlePostComment}
                                disabled={isPosting}
                                className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white rounded-[var(--r-sm)] px-4 oneui-press oneui-ring disabled:opacity-50
                                    shadow-[0_4px_14px_-4px_rgba(37,99,235,0.8),inset_0_1px_0_rgba(255,255,255,0.25)]"
                                aria-label="Відправити коментар"
                            >
                                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
