export default function StatusBadge({ status }) {
    const label = status || 'Нова';
    const lower = label.toLowerCase();

    // Нова (default)
    let colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_14px_-2px_rgba(59,130,246,0.45)]';

    if (lower.includes('розгляд'))
        colorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-[0_0_14px_-2px_rgba(234,179,8,0.45)]';
    else if (lower.includes('робот'))
        colorClass = 'bg-green-500/20 text-green-300 border-green-500/30 shadow-[0_0_14px_-2px_rgba(34,197,94,0.45)]';
    else if (lower.includes('реаліз') || lower.includes('виконан'))
        colorClass = 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_14px_-2px_rgba(168,85,247,0.45)]';
    else if (lower.includes('відхил'))
        colorClass = 'bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_14px_-2px_rgba(239,68,68,0.45)]';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border
                backdrop-blur-sm uppercase tracking-wider whitespace-nowrap shrink-0 ${colorClass}`}
        >
            {label}
        </span>
    );
}
