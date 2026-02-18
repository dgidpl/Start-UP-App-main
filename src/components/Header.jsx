import { Home, Lightbulb, Database, Phone } from 'lucide-react';
import Logo from './Logo';

const tabs = [
    { id: 'home', icon: Home, label: 'Головна' },
    { id: 'submit', icon: Lightbulb, label: 'Подати ідею' },
    { id: 'bank', icon: Database, label: 'Банк ідей' },
    { id: 'contacts', icon: Phone, label: 'Контакти' },
];

function NavItem({ icon: Icon, label, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/10
        ${isActive
                    ? 'text-yellow-400 font-bold bg-white/5 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
        >
            <Icon size={18} className={isActive ? "stroke-[2.5px]" : ""} />
            <span>{label}</span>
        </button>
    );
}

const tabLabels = {
    home: 'Головна',
    submit: 'Нова ідея',
    bank: 'Банк ідей',
    contacts: 'Контакти',
};

export default function Header({ activeTab, onTabChange }) {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('home')}>
                    <Logo />
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Start-UP
                    </span>
                </div>

                <nav className="hidden md:flex gap-2">
                    {tabs.map(tab => (
                        <NavItem
                            key={tab.id}
                            icon={tab.icon}
                            label={tab.label}
                            isActive={activeTab === tab.id}
                            onClick={() => onTabChange(tab.id)}
                        />
                    ))}
                </nav>

                <div className="md:hidden text-sm font-medium text-slate-400">
                    {tabLabels[activeTab] || 'Головна'}
                </div>
            </div>
        </header>
    );
}
