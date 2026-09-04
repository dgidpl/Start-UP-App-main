import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Notification from './components/Notification';
import HomeView from './views/HomeView';
import SubmitView from './views/SubmitView';
import BankView from './views/BankView';
import ContactsView from './views/ContactsView';
import * as api from './services/api';

const VALID_TABS = ['home', 'submit', 'bank', 'contacts'];

// Ледь помітне зерно — прибирає «пластиковість» скла
const NOISE_URI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export default function App() {
    const [activeTab, setActiveTab] = useState(() => {
        const saved = sessionStorage.getItem('npu_active_tab');
        return VALID_TABS.includes(saved) ? saved : 'home';
    });
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const [localVotes, setLocalVotes] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('npu_ideas_votes')) || { support: {}, reject: {} };
        } catch {
            return { support: {}, reject: {} };
        }
    });

    const isFirstLoad = useRef(true);

    const fetchIdeas = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.fetchIdeas();

            if (data.status === 'error') {
                throw new Error(data.message || "Server Error");
            }

            if (Array.isArray(data)) {
                setIdeas([...data].reverse());
            } else {
                console.warn("API Data format error:", data);
                setIdeas([]);
            }
        } catch (error) {
            console.error("API Error details:", error);
            if (!silent) showNotify("Помилка завантаження: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    }, []);

    // Зберігаємо активну вкладку
    useEffect(() => {
        sessionStorage.setItem('npu_active_tab', activeTab);
    }, [activeTab]);

    // Попереднє завантаження даних одразу при відкритті сайту
    useEffect(() => {
        fetchIdeas();
    }, [fetchIdeas]);

    // Автооновлення кожні 30с на вкладці "Банк"
    useEffect(() => {
        if (activeTab === 'bank') {
            fetchIdeas(true);
            const interval = setInterval(() => fetchIdeas(true), 30000);
            return () => clearInterval(interval);
        }
    }, [activeTab, fetchIdeas]);

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const TAB_ORDER = { home: 0, submit: 1, bank: 2, contacts: 3 };
    const [slideState, setSlideState] = useState('idle'); // idle | out | in
    const [slideDir, setSlideDir] = useState(1); // 1 = right-to-left, -1 = left-to-right

    const handleTabChange = (newTab) => {
        if (newTab === activeTab) return;
        const dir = TAB_ORDER[newTab] > TAB_ORDER[activeTab] ? 1 : -1;
        setSlideDir(dir);
        setSlideState('out');
        setTimeout(() => {
            setActiveTab(newTab);
            setSlideState('in');
            setTimeout(() => setSlideState('idle'), 250);
        }, 200);
    };

    // One UI масштабує, а не лише зсуває
    const getSlideStyle = () => {
        if (slideState === 'out') return {
            transform: `translateX(${-slideDir * 48}px) scale(0.97)`,
            opacity: 0,
            transition: 'transform 0.2s var(--ease-oneui), opacity 0.2s var(--ease-oneui)',
        };
        if (slideState === 'in') return {
            transform: `translateX(${slideDir * 48}px) scale(0.97)`,
            opacity: 0,
            transition: 'none',
        };
        return {
            transform: 'translateX(0) scale(1)',
            opacity: 1,
            transition: 'transform 0.3s var(--ease-oneui), opacity 0.3s var(--ease-oneui)',
        };
    };

    const renderView = () => {
        switch (activeTab) {
            case 'home': return <HomeView onChangeTab={handleTabChange} />;
            case 'submit': return <SubmitView showNotify={showNotify} onChangeTab={handleTabChange} refreshIdeas={() => fetchIdeas(true)} />;
            case 'bank': return <BankView ideas={ideas} loading={loading} localVotes={localVotes} setLocalVotes={setLocalVotes} showNotify={showNotify} refreshIdeas={() => fetchIdeas(true)} />;
            case 'contacts': return <ContactsView />;
            default: return <HomeView onChangeTab={handleTabChange} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30 selection:text-yellow-200 pb-24 md:pb-0">
            {/* Фон: aurora-плями + зерно */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-15%] w-[65%] h-[55%] bg-blue-900/25 rounded-full blur-[80px] md:blur-[120px] animate-aurora"></div>
                <div className="absolute bottom-[-15%] right-[-15%] w-[65%] h-[55%] bg-indigo-900/25 rounded-full blur-[80px] md:blur-[120px] animate-aurora" style={{ animationDelay: '-6s' }}></div>
                <div className="absolute top-[35%] left-[25%] w-[45%] h-[40%] bg-yellow-500/[0.07] rounded-full blur-[80px] md:blur-[130px] animate-aurora" style={{ animationDelay: '-12s' }}></div>
                <div
                    className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
                    style={{ backgroundImage: NOISE_URI, backgroundRepeat: 'repeat' }}
                ></div>
            </div>

            {/* Header */}
            <Header activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Main Content with slide transition */}
            <main
                className="relative z-10 max-w-6xl mx-auto px-4 py-4 sm:px-5 md:p-6"
                style={getSlideStyle()}
            >
                {renderView()}
            </main>

            {/* Mobile Expandable Navbar */}
            <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Notifications */}
            <Notification notification={notification} />
        </div>
    );
}
