import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Database, User, Clock, ThumbsUp, ThumbsDown, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, Tag, Filter, BarChart3, CheckCircle2, Flame, Layers, Eye, XCircle, Clock3, X, RotateCcw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import IdeaModal from '../components/IdeaModal';
import useScrollReveal from '../hooks/useScrollReveal';
import useCountUp from '../hooks/useCountUp';
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

// Скелетон-картка — під нову висоту картки ідеї
function SkeletonCard() {
    return (
        <div className="card-depth bg-slate-800/40 border border-white/5 p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-start gap-3">
                <div className="skeleton h-6 w-28"></div>
                <div className="skeleton h-4 w-16"></div>
            </div>
            <div className="skeleton h-5 w-40"></div>
            <div className="space-y-2">
                <div className="skeleton h-5 w-full"></div>
                <div className="skeleton h-5 w-3/4"></div>
            </div>
            <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex gap-3">
                    <div className="skeleton h-4 w-28"></div>
                    <div className="skeleton h-4 w-20"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="skeleton h-11 rounded-xl"></div>
                    <div className="skeleton h-11 rounded-xl"></div>
                    <div className="skeleton h-11 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}

// Акценти плиток статистики — ті самі кольори, що були
const ACCENTS = {
    blue: { tile: 'bg-blue-500/15', icon: 'text-blue-400', glow: 'rgba(59,130,246,0.35)' },
    emerald: { tile: 'bg-emerald-500/15', icon: 'text-emerald-400', glow: 'rgba(16,185,129,0.35)' },
    orange: { tile: 'bg-orange-500/15', icon: 'text-orange-400', glow: 'rgba(249,115,22,0.35)' },
};

function StatTile({ icon: Icon, value, label, accent, index }) {
    const shown = useCountUp(value);
    const a = ACCENTS[accent];

    return (
        <div
            className="card-depth reveal relative overflow-hidden bg-slate-800/40 border border-white/5 p-3 sm:p-4 text-center min-w-0"
            style={{ '--i': index }}
        >
            <div
                aria-hidden="true"
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-2xl animate-glow-pulse pointer-events-none"
                style={{ background: a.glow, animationDelay: `${index * 0.6}s` }}
            />
            <div className="relative">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-2 rounded-xl ${a.tile} flex items-center justify-center`}>
                    <Icon size={20} className={a.icon} />
                </div>
                <div
                    className="font-bold text-white tabular-nums leading-none"
                    style={{ fontSize: 'clamp(1.25rem, 6vw, 1.6rem)' }}
                >
                    {shown}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-tight">{label}</div>
            </div>
        </div>
    );
}

const FILTERS = [
    { id: 'all', label: 'Всі ідеї', icon: Layers },
    { id: 'new', label: 'Нові', icon: Flame },
    { id: 'review', label: 'На розгляді', icon: Eye },
    { id: 'inwork', label: 'В роботі', icon: Clock3 },
    { id: 'done', label: 'Реалізовані', icon: CheckCircle2 },
    { id: 'rejected', label: 'Відхилені', icon: XCircle },
    { id: 'popular', label: 'Популярні', icon: BarChart3 },
];

// Кнопка голосування / коментарів
function ActionButton({ onClick, disabled, active, activeClass, ariaLabel, icon: Icon, count, animating, burst }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            className={`relative flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-xl text-sm border oneui-press oneui-ring disabled:cursor-not-allowed
                ${active ? activeClass : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300'}`}
        >
            <Icon size={16} className={animating ? 'vote-animate' : ''} />
            <span className={`tabular-nums ${animating ? 'vote-animate' : ''}`}>{count}</span>

            {burst && (
                <>
                    <span aria-hidden="true" className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-bold animate-rise-fade pointer-events-none">
                        +1
                    </span>
                    <span aria-hidden="true" className="absolute inset-0 rounded-xl border-2 border-current animate-ring-burst pointer-events-none" />
                </>
            )}
        </button>
    );
}

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
            result = result.filter(i => (i.status || 'Нова').toLowerCase().includes('нова'));
        } else if (activeFilter === 'review') {
            result = result.filter(i => (i.status || '').toLowerCase().includes('розгляд'));
        } else if (activeFilter === 'inwork') {
            result = result.filter(i => (i.status || '').toLowerCase().includes('робот'));
        } else if (activeFilter === 'done') {
            result = result.filter(i => {
                const s = (i.status || '').toLowerCase();
                return s.includes('реаліз') || s.includes('виконан');
            });
        } else if (activeFilter === 'rejected') {
            result = result.filter(i => (i.status || '').toLowerCase().includes('відхил'));
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
        const done = ideas.filter(i => {
            const s = (i.status || '').toLowerCase();
            return s.includes('реаліз') || s.includes('виконан');
        }).length;
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

    // Сходинкова поява плиток статистики та карток
    const revealRef = useScrollReveal([currentItems.map(i => i.id).join(','), loading]);

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
        setTimeout(() => setVotedId(null), 900);

        try {
            await api.vote(id, type);
            showNotify(type === 'up' ? "Ви підтримали цю ідею!" : "Ваш голос враховано");
            if (refreshIdeas) refreshIdeas();
        } catch {
            showNotify("Помилка збереження голосу на сервері", "error");
        }
    };

    const resetFilters = () => {
        setSearch('');
        setActiveFilter('all');
    };

    const activeFilterLabel = FILTERS.find(f => f.id === activeFilter)?.label || 'Всі ідеї';
    const hasFilters = search !== '' || activeFilter !== 'all';

    return (
        <div ref={revealRef} className="space-y-5">
            {/* Панель статистики */}
            {!loading && ideas.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <StatTile icon={Layers} value={stats.total} label="Всього ідей" accent="blue" index={0} />
                    <StatTile icon={CheckCircle2} value={stats.done} label="Реалізовано" accent="emerald" index={1} />
                    <StatTile icon={Flame} value={stats.topVotes} label="Макс. голосів" accent="orange" index={2} />
                </div>
            )}

            {/* Пошук + фільтр — прилипає ПІД хедером (h-16) */}
            <div className="sticky top-16 z-30 bg-slate-950/75 backdrop-blur-2xl saturate-150 py-4 -mx-4 px-4 sm:-mx-5 sm:px-5 md:mx-0 md:px-0">
                <div className="flex gap-2">
                    <div className="relative flex-1 min-w-0 group">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Пошук ідей..."
                            aria-label="Пошук ідей"
                            className="w-full bg-slate-900/70 backdrop-blur border border-white/10 rounded-[var(--r-lg)] py-3 pl-12 pr-11 outline-none text-white placeholder-slate-600
                                shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] transition-all duration-300
                                focus:border-yellow-400/40 focus:shadow-[inset_0_2px_6px_rgba(0,0,0,0.4),0_0_0_3px_rgba(250,204,21,0.18)]"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                aria-label="Очистити пошук"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-500 hover:text-white hover:bg-white/10 oneui-press animate-pop-in"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Кнопка фільтра */}
                    <div className="relative shrink-0" ref={filterRef}>
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            aria-label="Фільтрувати ідеї"
                            aria-expanded={filterOpen}
                            className={`h-full px-4 rounded-[var(--r-lg)] border flex items-center gap-2 text-sm font-medium whitespace-nowrap oneui-press oneui-ring
                                ${activeFilter !== 'all'
                                    ? 'bg-yellow-500/15 border-yellow-400/30 text-yellow-400 shadow-[0_0_16px_-4px_rgba(250,204,21,0.5)]'
                                    : 'bg-slate-900/70 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                }`}
                        >
                            <Filter size={18} />
                            <span className="hidden sm:inline">{activeFilterLabel}</span>
                        </button>

                        {/* Дропдаун */}
                        {filterOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] origin-top-right bg-slate-900/95 backdrop-blur-2xl saturate-150 border border-white/10 rounded-[var(--r-md)] overflow-hidden z-50 animate-pop-in shadow-[0_20px_50px_-12px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)]">
                                {FILTERS.map(f => {
                                    const Icon = f.icon;
                                    const isActive = activeFilter === f.id;
                                    return (
                                        <button
                                            key={f.id}
                                            onClick={() => { setActiveFilter(f.id); setFilterOpen(false); }}
                                            className={`relative w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors
                                                ${isActive
                                                    ? 'bg-yellow-500/10 text-yellow-400 font-semibold'
                                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {isActive && (
                                                <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-yellow-400" />
                                            )}
                                            <Icon size={16} className="shrink-0" />
                                            <span className="truncate">{f.label}</span>
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
                <div className="grid gap-4 sm:gap-5">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filteredIdeas.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Database size={48} className="mx-auto mb-4 opacity-20 animate-float-soft" />
                    <p>Ідей не знайдено</p>
                    {hasFilters && (
                        <button
                            onClick={resetFilters}
                            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-md)] bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-sm font-medium oneui-press oneui-ring"
                        >
                            <RotateCcw size={16} /> Скинути фільтри
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Картки ідей */}
                    <div className="grid gap-4 sm:gap-5">
                        {currentItems.map((idea, idx) => {
                            const isExpanded = expandedId === idea.id;
                            const hasVoted = !!(localVotes.support[idea.id] || localVotes.reject[idea.id]);

                            return (
                                <div
                                    key={idea.id}
                                    style={{ '--i': idx }}
                                    className="card-depth oneui-sheen reveal bg-slate-800/40 border border-white/5 p-5 sm:p-6 hover:bg-slate-800/60 hover:border-white/10 cursor-pointer"
                                    onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                                >
                                    {/* Ряд 1: статус + номер */}
                                    <div className="relative z-10 flex items-start justify-between gap-2 flex-wrap">
                                        <StatusBadge status={idea.status} />
                                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                            <span className="text-[10px] font-mono text-slate-600">#{idea.id}</span>
                                            <ChevronDown
                                                size={16}
                                                className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                style={{ transitionTimingFunction: 'var(--ease-oneui)' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Ряд 2: категорія окремим рядком */}
                                    {idea.topic && (
                                        <div className="relative z-10 mt-3">
                                            <span className="inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-medium border border-purple-500/20 backdrop-blur-sm">
                                                <Tag size={11} className="shrink-0" />
                                                <span className="truncate">{idea.topic}</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* Текст ідеї */}
                                    <h3 className={`idea-text relative z-10 text-[17px] sm:text-lg font-medium text-slate-100 leading-relaxed mt-3 ${isExpanded ? 'open' : ''}`}>
                                        {idea.content}
                                    </h3>

                                    {/* Футер: два рядки на мобільному, один на sm+ */}
                                    <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 text-sm text-slate-500 border-t border-white/5 pt-4 mt-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="flex items-center gap-1.5 min-w-0">
                                                <User size={14} className="shrink-0" />
                                                <span className="truncate">{idea.author || 'Анонім'}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5 shrink-0">
                                                <Clock size={14} />
                                                {new Date(idea.date).toLocaleDateString('uk-UA')}
                                            </span>
                                        </div>

                                        <div
                                            className="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto sm:shrink-0"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <ActionButton
                                                onClick={() => handleVote(idea.id, 'up')}
                                                disabled={hasVoted}
                                                active={!!localVotes.support[idea.id]}
                                                activeClass="bg-green-500/20 border-green-500/30 text-green-400 shadow-[0_0_16px_-4px_rgba(34,197,94,0.6)]"
                                                ariaLabel={`Підтримати ідею ${idea.id}`}
                                                icon={ThumbsUp}
                                                count={idea.upvotes || 0}
                                                animating={votedId === idea.id + '-up'}
                                                burst={votedId === idea.id + '-up'}
                                            />
                                            <ActionButton
                                                onClick={() => handleVote(idea.id, 'down')}
                                                disabled={hasVoted}
                                                active={!!localVotes.reject[idea.id]}
                                                activeClass="bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_16px_-4px_rgba(239,68,68,0.6)]"
                                                ariaLabel={`Відхилити ідею ${idea.id}`}
                                                icon={ThumbsDown}
                                                count={idea.downvotes || 0}
                                                animating={votedId === idea.id + '-down'}
                                                burst={votedId === idea.id + '-down'}
                                            />
                                            <ActionButton
                                                onClick={() => setSelectedIdea(idea)}
                                                active
                                                activeClass="bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                                                ariaLabel={`Коментарі до ідеї ${idea.id}`}
                                                icon={MessageSquare}
                                                count={commentCounts[idea.id] || 0}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Пагінація */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center items-center gap-2 mt-8 pb-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white oneui-press oneui-ring"
                                aria-label="Попередня сторінка"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex flex-wrap justify-center gap-1">
                                {pageNumbers.map((page, idx) =>
                                    page === '...' ? (
                                        <span key={`dots-${idx}`} className="min-w-9 h-9 flex items-center justify-center text-slate-500">…</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            aria-current={currentPage === page ? 'page' : undefined}
                                            className={`min-w-9 h-9 px-2 rounded-xl text-sm font-medium border shrink-0 oneui-press oneui-ring
                                                ${currentPage === page
                                                    ? 'bg-yellow-500/20 border-yellow-400/40 text-yellow-300 shadow-[0_0_18px_-4px_rgba(250,204,21,0.6)]'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
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
                                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white oneui-press oneui-ring"
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
