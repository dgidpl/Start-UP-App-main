import { ShieldAlert, ThumbsUp } from 'lucide-react';

export default function Notification({ notification }) {
    if (!notification) return null;

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`fixed top-20 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-slide-in
        ${notification.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}
        >
            {notification.type === 'error' ? <ShieldAlert size={20} /> : <ThumbsUp size={20} />}
            <span className="font-medium">{notification.msg}</span>
        </div>
    );
}
