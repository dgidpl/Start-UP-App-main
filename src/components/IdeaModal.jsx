import { useState, useEffect } from 'react';
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

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Заголовок */}
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <h2 id="modal-title" className="text-xl font-bold text-white">Ідея #{idea.id}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white" aria-label="Закрити">
                        <X size={20} />
                    </button>
                </div>

                {/* Контент ідеї */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-slate-300 leading-relaxed overflow-y-auto flex-shrink-0 max-h-[30vh] border border-white/5">
                    {idea.content}
                </div>

                {/* Коментарі */}
                <div className="flex flex-col flex-grow min-h-0">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <MessageSquare size={14} /> Обговорення
                    </h3>

                    <div className="flex-grow overflow-y-auto space-y-3 mb-4 pr-2">
                        {isLoadingComments ? (
                            <div className="text-center py-4 text-slate-500"><Loader2 className="animate-spin mx-auto" /></div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-4 text-slate-600 text-sm">Коментарів ще немає. Будьте першим!</div>
                        ) : (
                            comments.map((c, idx) => (
                                <div key={idx} className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-blue-400">{c.author}</span>
                                        <span className="text-xs text-slate-600">{new Date(c.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-300">{c.text}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Форма коментаря */}
                    <div className="space-y-3 pt-3 border-t border-white/10 mt-auto">
                        <input
                            type="text"
                            placeholder="Ваш нікнейм"
                            className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                            value={authorName}
                            onChange={e => setAuthorName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ваш коментар..."
                                className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                            />
                            <button
                                onClick={handlePostComment}
                                disabled={isPosting}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                                aria-label="Відправити коментар"
                            >
                                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
