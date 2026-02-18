export default function StatusBadge({ status }) {
    const label = status || 'Нова';
    const lower = label.toLowerCase();

    let colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';       // Нова (default)

    if (lower.includes('розгляд'))
        colorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';  // На розгляді
    else if (lower.includes('робот'))
        colorClass = 'bg-green-500/20 text-green-300 border-green-500/30';     // В роботі
    else if (lower.includes('реаліз') || lower.includes('виконан'))
        colorClass = 'bg-purple-500/20 text-purple-300 border-purple-500/30';  // Реалізовано
    else if (lower.includes('відхил'))
        colorClass = 'bg-red-500/20 text-red-300 border-red-500/30';           // Відхилено

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass} uppercase tracking-wider`}>
            {label}
        </span>
    );
}
