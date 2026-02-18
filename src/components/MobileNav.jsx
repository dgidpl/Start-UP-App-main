import { Home, Lightbulb, Database, Phone } from 'lucide-react';

const tabs = [
    { id: 'home', icon: Home, label: 'Головна' },
    { id: 'submit', icon: Lightbulb, label: 'Подати' },
    { id: 'bank', icon: Database, label: 'Банк' },
    { id: 'contacts', icon: Phone, label: 'Контакти' },
];

export default function MobileNav({ activeTab, onTabChange }) {
    return (
        <nav
            className="mobile-nav fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe"
            aria-label="Мобільне меню"
        >
            {tabs.map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    className={`mobile-nav-item ${activeTab === id ? 'active' : ''}`}
                    onClick={() => onTabChange(id)}
                    aria-label={label}
                    aria-current={activeTab === id ? 'page' : undefined}
                >
                    <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
                    <div className="text-wrapper">
                        <div className="nav-text"><span>{label}</span></div>
                    </div>
                </button>
            ))}
        </nav>
    );
}
