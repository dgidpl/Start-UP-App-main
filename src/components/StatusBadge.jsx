export default function StatusBadge({ status }) {
    let colorClass = "bg-blue-500/20 text-blue-300 border-blue-500/30";
    let label = status || "Нова";
    const lower = label.toLowerCase();

    if (lower.includes("робот")) colorClass = "bg-green-500/20 text-green-300 border-green-500/30";
    if (lower.includes("відхил")) colorClass = "bg-red-500/20 text-red-300 border-red-500/30";

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass} uppercase tracking-wider`}>
            {label}
        </span>
    );
}
