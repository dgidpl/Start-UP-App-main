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

    const getSlideStyle = () => {
        if (slideState === 'out') return {
            transform: `translateX(${-slideDir * 60}px)`,
            opacity: 0,
            transition: 'transform 0.2s ease-in, opacity 0.2s ease-in',
        };
        if (slideState === 'in') return {
            transform: `translateX(${slideDir * 60}px)`,
            opacity: 0,
            transition: 'none',
        };
        return {
            transform: 'translateX(0)',
            opacity: 1,
            transition: 'transform 0.25s ease-out, opacity 0.25s ease-out',
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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30 selection:text-yellow-200 overflow-x-hidden pb-20 md:pb-0">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header */}
            <Header activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Main Content with slide transition */}
            <main
                className="relative z-10 max-w-6xl mx-auto p-4 md:p-6"
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
