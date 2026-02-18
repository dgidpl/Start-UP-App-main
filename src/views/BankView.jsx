import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Database, User, Clock, ThumbsUp, ThumbsDown, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, Tag, Filter, BarChart3, CheckCircle2, Flame, Layers } from 'lucide-react';
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

// Скелетон-картка
function SkeletonCard() {
    return (
        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
                <div className="skeleton h-6 w-20"></div>
                <div className="skeleton h-4 w-24"></div>
            </div>
            <div className="space-y-2">
                <div className="skeleton h-5 w-full"></div>
                <div className="skeleton h-5 w-3/4"></div>
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                <div className="flex gap-3">
                    <div className="skeleton h-4 w-24"></div>
                    <div className="skeleton h-4 w-20"></div>
                </div>
                <div className="flex gap-2">
                    <div className="skeleton h-8 w-16 rounded-lg"></div>
                    <div className="skeleton h-8 w-16 rounded-lg"></div>
                    <div className="skeleton h-8 w-12 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
}

const FILTERS = [
    { id: 'all', label: 'Всі ідеї', icon: Layers },
    { id: 'new', label: 'Нові', icon: Flame },
    { id: 'popular', label: 'Популярні', icon: BarChart3 },
    { id: 'done', label: 'Реалізовані', icon: CheckCircle2 },
];

export default function BankView({ ideas, loading, localVotes, setLocalVotes, showNotify, refreshIdeas }) {
    const [search, setSearch] = useState('');
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [commentCounts, setCommentCounts] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState('all');
    const [filterOpen, setFilterOpen] = useState(false);
    const [votedId, setVotedId] = useState(null);
    const filterRef = useRef(null);
    const itemsPerPage = 10;

    // Завантаження кількості коментарів
    useEffect(() => {
        const loadCounts = async () => {
            const counts = {};
            for (const idea of ideas) {
                try {
                    const comments = await api.getComments(idea.id);
                    if (Array.isArray(comments) && comments.length > 0) {
                        counts[idea.id] = comments.length;
                    }
                } catch { /* ignore */ }
            }
            setCommentCounts(counts);
        };
        if (ideas.length > 0) loadCounts();
    }, [ideas]);

    // Закриття фільтра при кліку зовні
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Фільтрація + пошук
    const filteredIdeas = useMemo(() => {
        let result = ideas;

        // Фільтр за статусом
        if (activeFilter === 'new') {
            result = result.filter(i => i.status === 'Нова');
        } else if (activeFilter === 'done') {
            result = result.filter(i => i.status === 'Реалізовано' || i.status === 'Виконано');
        } else if (activeFilter === 'popular') {
            result = [...result].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        }

        // Пошук
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(idea =>
                (idea.content && idea.content.toLowerCase().includes(q)) ||
                (idea.author && idea.author.toLowerCase().includes(q)) ||
                (idea.topic && idea.topic.toLowerCase().includes(q))
            );
        }

        return result;
    }, [ideas, search, activeFilter]);

    // Статистика
    const stats = useMemo(() => {
        const total = ideas.length;
        const done = ideas.filter(i => i.status === 'Реалізовано' || i.status === 'Виконано').length;
        const topVotes = ideas.reduce((max, i) => Math.max(max, i.upvotes || 0), 0);
        return { total, done, topVotes };
    }, [ideas]);

    // Скидання сторінки при пошуку / фільтрі
    useEffect(() => {
        setCurrentPage(1);
    }, [search, activeFilter]);

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

        // Анімація
        setVotedId(id + '-' + type);
        setTimeout(() => setVotedId(null), 500);

        try {
            await api.vote(id, type);
            showNotify(type === 'up' ? "Ви підтримали цю ідею!" : "Ваш голос враховано");
            if (refreshIdeas) refreshIdeas();
        } catch {
            showNotify("Помилка збереження голосу на сервері", "error");
        }
    };

    const activeFilterLabel = FILTERS.find(f => f.id === activeFilter)?.label || 'Всі ідеї';

    return (
        <div className="space-y-5">
            {/* Панель статистики */}
            {!loading && ideas.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="card-depth glass-edge bg-slate-800/40 border border-white/5 rounded-2xl p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/15 flex items-center justify-center">
                            <Layers size={20} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Всього ідей</div>
                    </div>
                    <div className="card-depth glass-edge bg-slate-800/40 border border-white/5 rounded-2xl p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.done}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Реалізовано</div>
                    </div>
                    <div className="card-depth glass-edge bg-slate-800/40 border border-white/5 rounded-2xl p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-500/15 flex items-center justify-center">
                            <Flame size={20} className="text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.topVotes}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Макс. голосів</div>
                    </div>
                </div>
            )}

            {/* Пошук + фільтр */}
            <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none border-white/5">
                <div className="flex gap-2">
                    <div className="relative flex-1">
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

                    {/* Кнопка фільтра */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className={`h-full px-4 rounded-2xl border transition-all flex items-center gap-2 text-sm font-medium ${activeFilter !== 'all'
                                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                }`}
                            aria-label="Фільтрувати ідеї"
                        >
                            <Filter size={18} />
                            <span className="hidden sm:inline">{activeFilterLabel}</span>
                        </button>

                        {/* Дропдаун */}
                        {filterOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
                                {FILTERS.map(f => {
                                    const Icon = f.icon;
                                    return (
                                        <button
                                            key={f.id}
                                            onClick={() => { setActiveFilter(f.id); setFilterOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${activeFilter === f.id
                                                    ? 'bg-blue-500/15 text-blue-400'
                                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <Icon size={16} />
                                            {f.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Контент */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
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

                                {/* Текст — обрізаний або повний */}
                                <h3 className={`text-lg font-medium text-slate-200 mb-1 transition-all duration-300 ${expandedId === idea.id ? '' : 'line-clamp-2'}`}>
                                    {idea.content}
                                </h3>

                                <div className="flex items-center justify-between text-sm text-slate-500 border-t border-white/5 pt-3 mt-2">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><User size={14} /> {idea.author || 'Анонім'}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(idea.date).toLocaleDateString('uk-UA')}</span>
                                    </div>

                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleVote(idea.id, 'up')}
                                            disabled={localVotes.support[idea.id] || localVotes.reject[idea.id]}
                                            aria-label={`Підтримати ідею ${idea.id}`}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${localVotes.support[idea.id] ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <ThumbsUp size={16} className={votedId === idea.id + '-up' ? 'vote-animate' : ''} />
                                            <span className={votedId === idea.id + '-up' ? 'vote-animate' : ''}>{idea.upvotes || 0}</span>
                                        </button>

                                        <button
                                            onClick={() => handleVote(idea.id, 'down')}
                                            disabled={localVotes.support[idea.id] || localVotes.reject[idea.id]}
                                            aria-label={`Відхилити ідею ${idea.id}`}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${localVotes.reject[idea.id] ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <ThumbsDown size={16} className={votedId === idea.id + '-down' ? 'vote-animate' : ''} />
                                            <span className={votedId === idea.id + '-down' ? 'vote-animate' : ''}>{idea.downvotes || 0}</span>
                                        </button>

                                        <button
                                            onClick={() => setSelectedIdea(idea)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 transition-colors"
                                            aria-label={`Коментарі до ідеї ${idea.id}`}
                                        >
                                            <MessageSquare size={16} />
                                            <span>{commentCounts[idea.id] || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Пагінація */}
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
