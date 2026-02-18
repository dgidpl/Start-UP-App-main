export default function Logo({ className = "w-10 h-10" }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-glow" aria-hidden="true">
                <defs>
                    <linearGradient id="shieldGradient" x1="15" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e3a5f" />
                        <stop offset="1" stopColor="#0f2440" />
                    </linearGradient>
                </defs>
                <path d="M50 5L15 20V50C15 75 50 95 50 95C50 95 85 75 85 50V20L50 5Z" fill="url(#shieldGradient)" stroke="#ffd700" strokeWidth="2" />
                <circle cx="50" cy="45" r="15" fill="#ffd700" fillOpacity="0.2" />
                <path d="M50 30C41.7 30 35 36.7 35 45C35 51.5 39 57 44 59V63C44 64.1 44.9 65 46 65H54C55.1 65 56 64.1 56 63V59C61 57 65 51.5 65 45C65 36.7 58.3 30 50 30ZM48 68H52V70H48V68Z" fill="#ffd700" />
            </svg>
        </div>
    );
}
