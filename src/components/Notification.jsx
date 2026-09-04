import { ShieldAlert, ThumbsUp } from 'lucide-react';

export default function Notification({ notification }) {
    if (!notification) return null;

    const isError = notification.type === 'error';

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`fixed top-[calc(4rem+0.75rem)] left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100]
                px-4 py-3 rounded-[var(--r-md)] backdrop-blur-xl saturate-150 border flex items-start gap-3 animate-pop-in
                shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]
                ${isError
                    ? 'bg-red-500/25 border-red-400/40 text-red-50'
                    : 'bg-emerald-500/25 border-emerald-400/40 text-emerald-50'}`}
        >
            <span className={`shrink-0 mt-0.5 ${isError ? 'text-red-300' : 'text-emerald-300'}`}>
                {isError ? <ShieldAlert size={20} /> : <ThumbsUp size={20} />}
            </span>
            <span className="font-medium text-sm leading-snug break-words min-w-0">{notification.msg}</span>
        </div>
    );
}
