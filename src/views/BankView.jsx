import { useState, useEffect, useMemo } from 'react';
import { Search, Database, User, Clock, ThumbsUp, ThumbsDown, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, Loader2, Tag } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import IdeaModal from '../components/IdeaModal';
import * as api from '../services/api';

function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');
    pages.push(total);
    return pages;
}

export default function BankView({ ideas, loading, localVotes, setLocalVotes, showNotify, refreshIdeas }) {
    const [search, setSearch] = useState('');
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredIdeas = useMemo(() => {
        return ideas.filter(idea =>
            (idea.content && idea.content.toLowerCase().includes(search.toLowerCase())) ||
            (idea.author && idea.author.toLowerCase().includes(search.toLowerCase()))
        );
    }, [ideas, search]);

    // Скидання сторінки при пошуку
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // Пагінація
    const totalPages = Math.ceil(filteredIdeas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredIdeas.slice(indexOfFirstItem, indexOfLastItem);
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    const handleVote = async (id, type) => {
        if (localVotes.support[id] || localVotes.reject[id]) return;

        const voteKey = type === 'up' ? 'support' : 'reject';
        const newVotes = {
            ...localVotes,
            [voteKey]: { ...localVotes[voteKey], [id]: true }
        };
        setLocalVotes(newVotes);
        localStorage.setItem('npu_ideas_votes', JSON.stringify(newVotes));

        try {
            await api.vote(id, type);
            showNotify(type === 'up' ? "Ви підтримали цю ідею!" : "Ваш голос враховано");
            if (refreshIdeas) refreshIdeas();
        } catch {
            showNotify("Помилка збереження голосу на сервері", "error");
        }
    };

    return (
        <div className="space-y-6">
            {/* Пошук */}
            <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none border-white/5">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Пошук ідей..."
                        aria-label="Пошук ідей"
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-white placeholder-slate-600 shadow-inner"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Контент */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
                    <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                    <p>Завантаження бази даних...</p>
                </div>
            ) : filteredIdeas.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Database size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Ідей не знайдено</p>
                </div>
            ) : (
                <>
                    {/* Картки ідей */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                        {currentItems.map(idea => (
                            <div
                                key={idea.id}
                                className="card-depth glass-edge bg-slate-800/40 border border-white/5 rounded-2xl p-5 hover:bg-slate-800/60 backdrop-blur-sm group cursor-pointer"
                                onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={idea.status} />
                                        {idea.topic && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-xs font-medium border border-purple-500/20">
                                                <Tag size={10} /> {idea.topic}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-600">#{idea.id}</span>
                                        <ChevronDown
                                            size={16}
                                            className={`text-slate-500 transition-transform duration-300 ${expandedId === idea.id ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </div>

                                {/* Заголовок — обрізаний або повний */}
                                <h3 className={`text-lg font-medium text-slate-200 mb-1 ${expandedId === idea.id ? '' : 'line-clamp-2'}`}>
                                    {idea.content}
                                </h3>

                                {/* Розгорнутий блок */}
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateRows: expandedId === idea.id ? '1fr' : '0fr',
                                        transition: 'grid-template-rows 0.3s ease',
                                    }}
                                >
                                    <div style={{ overflow: 'hidden' }}>
                                        <div className="pt-3 pb-1 text-sm text-slate-400 whitespace-pre-wrap">
                                            {idea.content}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-slate-500 border-t border-white/5 pt-3 mt-2">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><User size={14} /> {idea.author || 'Анонім'}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(idea.date).toLocaleDateString('uk-UA')}</span>
                                    </div>

                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleVote(idea.id, 'up')}
                                            disabled={localVotes.support[idea.id] || localVotes.reject[idea.id]}
                                            aria-label={`Підтримати ідею ${idea.id}. Голосів: ${idea.upvotes || 0}`}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${localVotes.support[idea.id] ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <ThumbsUp size={16} /> <span>{idea.upvotes || 0}</span>
                                        </button>

                                        <button
                                            onClick={() => handleVote(idea.id, 'down')}
                                            disabled={localVotes.support[idea.id] || localVotes.reject[idea.id]}
                                            aria-label={`Відхилити ідею ${idea.id}. Голосів: ${idea.downvotes || 0}`}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${localVotes.reject[idea.id] ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <ThumbsDown size={16} /> <span>{idea.downvotes || 0}</span>
                                        </button>

                                        <button
                                            onClick={() => setSelectedIdea(idea)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400"
                                            aria-label={`Коментарі до ідеї ${idea.id}`}
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Пагінація (window-підхід) */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 pb-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-300 hover:text-white"
                                aria-label="Попередня сторінка"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex gap-1">
                                {pageNumbers.map((page, idx) =>
                                    page === '...' ? (
                                        <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-500">…</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors flex-shrink-0
                        ${currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-300 hover:text-white"
                                aria-label="Наступна сторінка"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Модалка коментарів */}
            {selectedIdea && (
                <IdeaModal
                    idea={selectedIdea}
                    onClose={() => setSelectedIdea(null)}
                    showNotify={showNotify}
                />
            )}
        </div>
    );
}
