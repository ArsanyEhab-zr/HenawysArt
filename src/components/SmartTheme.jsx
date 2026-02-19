import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// ==========================================
// 🎨 مكتبة أيقونات Premium SVG (Vector Graphics) الحصرية
// ==========================================
const PremiumIcons = {
    // هلال رمضان الذهبي الفاخر
    Crescent: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#goldGradient)" />
            <circle cx="12" cy="10" r="1" fill="#FFF" filter="url(#glow)" />
            <circle cx="15" cy="14" r="0.8" fill="#FFF" filter="url(#glow)" />
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
        </svg>
    ),
    // فانوس رمضان بتفاصيل دقيقة
    Lantern: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
            <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.2L18.4 7 12 10.2 5.6 7 12 4.2zM6 8.5l6 3.2 6-3.2v8.8L12 20.5 6 17.3V8.5z" fill="url(#lanternGradient)" />
            <path d="M12 10.5V19" stroke="url(#goldLine)" strokeWidth="1" strokeLinecap="round" />
            <circle cx="12" cy="14.5" r="1.5" fill="#FDE047" filter="url(#glow)" />
            <defs>
                <linearGradient id="lanternGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="goldLine" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    ),
    // بالونات العيد المبهجة
    Balloons: () => (
        <svg viewBox="0 0 32 32" fill="none" className="w-16 h-16 md:w-24 md:h-24 drop-shadow-md">
            <g transform="translate(2,2)">
                <path d="M10 2C5.5 2 2 5.5 2 10s3.5 8 8 8 8-3.5 8-8-3.5-8-8-8z" fill="url(#balloon1)" />
                <path d="M10 18c-0.5 1.5-1 3-1 5s0.5 3.5 1 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <g transform="translate(14,4) scale(0.9)">
                <path d="M10 2C5.5 2 2 5.5 2 10s3.5 8 8 8 8-3.5 8-8-3.5-8-8-8z" fill="url(#balloon2)" />
                <path d="M10 18c0 1.5 0.5 3 1 5s-0.5 3.5-1 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <defs>
                <radialGradient id="balloon1" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#B91C1C" />
                </radialGradient>
                <radialGradient id="balloon2" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                </radialGradient>
            </defs>
        </svg>
    ),
    // الكعبة المشرفة بتصميم هندسي
    Kaaba: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#1F2937" stroke="#111827" strokeWidth="1" />
            <path d="M3 7l9 5 9-5M12 12v10" stroke="#374151" strokeWidth="1" />
            <path d="M4.5 8l7.5 4 7.5-4" stroke="url(#goldBand)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 6l-1.5 1 1.5 1 1.5-1-1.5-1z" fill="#FDE047" filter="url(#glow)" />
            <defs>
                <linearGradient id="goldBand" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FDE047" />
                </linearGradient>
            </defs>
        </svg>
    ),
    // خروف العيد اللطيف
    Sheep: () => (
        <svg viewBox="0 0 32 32" fill="none" className="w-14 h-14 md:w-20 md:h-20 drop-shadow-md">
            <path d="M8 12c0-3.3 2.7-6 6-6s6 2.7 6 6v2h-2v-2c0-2.2-1.8-4-4-4s-4 1.8-4 4v2H8v-2z" fill="#E5E7EB" />
            <path d="M22 16c0-4.4-3.6-8-8-8s-8 3.6-8 8c0 3 1.7 5.6 4.2 7-0.8 1-1.2 2.3-1.2 3.7 0 0.8 0.2 1.5 0.5 2.2l1.3-0.8c-0.2-0.5-0.3-1-0.3-1.5 0-1.1 0.5-2.1 1.2-2.8 0.5 0.1 1 0.2 1.6 0.2 1.7 0 3.3-0.7 4.4-1.8 1.1 1.1 2.7 1.8 4.4 1.8 0.6 0 1.1-0.1 1.6-0.2 0.8 0.7 1.2 1.7 1.2 2.8 0 0.5-0.1 1-0.3 1.5l1.3 0.8c0.3-0.7 0.5-1.4 0.5-2.2 0-1.4-0.4-2.7-1.2-3.7 2.5-1.4 4.2-4 4.2-7z" fill="url(#woolGradient)" />
            <path d="M14 24c0 1.1-0.9 2-2 2s-2-0.9-2-2v-2h4v2zm8 0c0 1.1-0.9 2-2 2s-2-0.9-2-2v-2h4v2z" fill="#374151" />
            <circle cx="12" cy="16" r="1.5" fill="#1F2937" />
            <circle cx="20" cy="16" r="1.5" fill="#1F2937" />
            <path d="M16 19c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2z" fill="#FCA5A5" />
            <defs>
                <radialGradient id="woolGradient" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </radialGradient>
            </defs>
        </svg>
    ),
    // شجرة الكريسماس المزينة
    Tree: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 md:w-20 md:h-20 drop-shadow-lg">
            <path d="M12 2L3 14h4l-3 8h16l-3-8h4L12 2z" fill="url(#treeGradient)" />
            <path d="M10 22h4v2h-4v-2z" fill="#78350F" />
            <circle cx="12" cy="4" r="1.8" fill="#FDE047" filter="url(#glow)" />
            <circle cx="9" cy="10" r="1" fill="#FCA5A5" />
            <circle cx="15" cy="12" r="1" fill="#93C5FD" />
            <circle cx="8" cy="16" r="1" fill="#FDE047" />
            <circle cx="16" cy="18" r="1" fill="#FCA5A5" />
            <defs>
                <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#047857" />
                </linearGradient>
            </defs>
        </svg>
    ),
    // ندفة الثلج الكريستالية
    Snowflake: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#snowGradient)" strokeWidth="1.5" strokeLinecap="round" className="w-10 h-10 md:w-14 md:h-14 drop-shadow-md">
            <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1L19.1 4.9" />
            <path d="M9 2L12 5 15 2M2 9l3 3-3 3M9 22l3-3 3 3M22 9l-3 3 3 3" />
            <defs>
                <linearGradient id="snowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E0F2FE" />
                    <stop offset="100%" stopColor="#7DD3FC" />
                </linearGradient>
            </defs>
        </svg>
    ),
    // صليب عيد الميلاد المجيد
    CopticCross: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            <path d="M11 2h2v6h6v2h-6v12h-2V10H5V8h6V2z" fill="url(#crossGradient)" />
            <circle cx="12" cy="12" r="3" stroke="url(#crossGradient)" strokeWidth="1.5" fill="none" />
            <path d="M12 4L12 2M12 22L12 20M20 12L22 12M4 12L2 12" stroke="url(#crossGradient)" strokeWidth="2" strokeLinecap="round" />
            <defs>
                <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
            </defs>
        </svg>
    ),
    // بيضة شم النسيم المزخرفة
    EasterEgg: () => (
        <svg viewBox="0 0 24 32" fill="none" className="w-12 h-16 md:w-16 md:h-20 drop-shadow-md">
            <path d="M12 1C6.5 1 2 8 2 16s4.5 15 10 15 10-8 10-15S17.5 1 12 1z" fill="url(#eggGradient)" />
            <path d="M2 16c0-1.1 2.2-2 5-2s5 0.9 5 2 2.2 2 5 2 5-0.9 5-2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <path d="M2 22c0-1.1 2.2-2 5-2s5 0.9 5 2 2.2 2 5 2 5-0.9 5-2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <path d="M2 10c0-1.1 2.2-2 5-2s5 0.9 5 2 2.2 2 5 2 5-0.9 5-2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <circle cx="7" cy="13" r="1" fill="rgba(255,255,255,0.8)" />
            <circle cx="17" cy="13" r="1" fill="rgba(255,255,255,0.8)" />
            <circle cx="12" cy="19" r="1" fill="rgba(255,255,255,0.8)" />
            <defs>
                <linearGradient id="eggGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F9A8D4" />
                    <stop offset="50%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#DB2777" />
                </linearGradient>
            </defs>
        </svg>
    ),
    // أرنب شم النسيم اللطيف
    Bunny: () => (
        <svg viewBox="0 0 32 32" fill="none" className="w-14 h-14 md:w-20 md:h-20 drop-shadow-md">
            <path d="M10 2c-1.1 0-2 0.9-2 2 0 3.3 2 6 2 8-1.1 0-2 0.9-2 2s0.9 2 2 2c0 3.3-2.7 6-6 6-1.1 0-2 0.9-2 2s0.9 2 2 2h16c1.1 0 2-0.9 2-2s-0.9-2-2-2c-3.3 0-6-2.7-6-6 0 0 1.1 0 2-2s-0.9-2-2-2c0-2 2-4.7 2-8 0-1.1-0.9-2-2-2s-2 0.9-2 2c0 2.7-1.3 5.1-3.3 6.6C11.3 7.1 10 4.7 10 2z" fill="url(#bunnyGradient)" />
            <path d="M13 18c0 0.6-0.4 1-1 1s-1-0.4-1-1 0.4-1 1-1 1 0.4 1 1z" fill="#374151" />
            <path d="M21 18c0 0.6-0.4 1-1 1s-1-0.4-1-1 0.4-1 1-1 1 0.4 1 1z" fill="#374151" />
            <path d="M16 20c-0.6 0-1 0.4-1 1s0.4 1 1 1 1-0.4 1-1-0.4-1-1-1z" fill="#FCA5A5" />
            <defs>
                <radialGradient id="bunnyGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F3F4F6" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </radialGradient>
            </defs>
        </svg>
    ),
    // قلب الفلانتين الفاخر
    Heart: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#heartGradient)" />
            <path d="M16.5 5c-1.3 0-2.5 0.6-3.3 1.6-0.4 0.5-0.8 1-1.2 1.4-0.4-0.4-0.8-0.9-1.2-1.4C10 5.6 8.8 5 7.5 5 5.5 5 4 6.5 4 8.5c0 3 2.9 5.6 7.3 9.8L12 19l0.7-0.7c4.4-4.2 7.3-6.8 7.3-9.8C20 6.5 18.5 5 16.5 5z" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            <defs>
                <radialGradient id="heartGradient" cx="30%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="100%" stopColor="#BE123C" />
                </radialGradient>
            </defs>
        </svg>
    ),
    // زهرة عيد الأم الأنيقة
    Flower: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-md">
            <path d="M12 2c-1.1 0-2 .9-2 2v2c-2.2 0-4 1.8-4 4s1.8 4 4 4v8h4v-8c2.2 0 4-1.8 4-4s-1.8-4-4-4V4c0-1.1-.9-2-2-2z" fill="url(#flowerGradient)" />
            <circle cx="12" cy="10" r="2" fill="#FDE047" />
            <path d="M12 14v8M8 18l4-4 4 4" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
                <linearGradient id="flowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#BE185D" />
                </linearGradient>
            </defs>
        </svg>
    ),
    // قبعة المهرج لكذبة أبريل
    JesterHat: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 md:w-20 md:h-20 drop-shadow-md">
            <path d="M12 2l-3 6H5l2 4-4 4 4 2v4h10v-4l4-2-4-4 2-4h-4l-3-6z" fill="url(#jesterGradient)" />
            <circle cx="5" cy="12" r="1.5" fill="#FDE047" />
            <circle cx="19" cy="12" r="1.5" fill="#FDE047" />
            <circle cx="12" cy="22" r="1.5" fill="#FDE047" />
            <path d="M9 16c1.5 1 4.5 1 6 0" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
                <linearGradient id="jesterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
            </defs>
        </svg>
    ),
};

const SmartTheme = () => {
    const [activeTheme, setActiveTheme] = useState(null);

    useEffect(() => {
        const today = new Date();
        const m = today.getMonth() + 1;
        const d = today.getDate();
        const currentGregorian = m * 100 + d;
        const isBetween = (start, end) => currentGregorian >= start && currentGregorian <= end;

        const hijriDateFormatter = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric', day: 'numeric' });
        const hijriParts = hijriDateFormatter.formatToParts(today);
        let hijriMonth = 0; let hijriDay = 0;

        hijriParts.forEach(part => {
            if (part.type === 'month') hijriMonth = parseInt(part.value, 10);
            if (part.type === 'day') hijriDay = parseInt(part.value, 10);
        });

        // ==========================================
        // 🗓️ أجندة المناسبات الشاملة
        // ==========================================
        if (hijriMonth === 9) setActiveTheme('ramadan');
        else if (hijriMonth === 10 && hijriDay >= 1 && hijriDay <= 3) setActiveTheme('eid_fitr');
        else if (hijriMonth === 12 && hijriDay >= 10 && hijriDay <= 13) setActiveTheme('eid_adha');
        else if (isBetween(401, 401)) setActiveTheme('april_fools');
        else if (isBetween(321, 321)) setActiveTheme('mothers_day');
        else if (isBetween(405, 420)) setActiveTheme('easter');
        else if (isBetween(106, 108)) setActiveTheme('coptic_christmas');
        else if (isBetween(1224, 1231) || isBetween(101, 102)) setActiveTheme('christmas');
        else if (isBetween(213, 215) || isBetween(1103, 1105)) setActiveTheme('valentine');
        else setActiveTheme(null);

    }, []);

    if (!activeTheme) return null;

    // Wrapper موحد للزينة (لازق تحت الناف بار)
    const ThemeWrapper = ({ children, className = "" }) => (
        <div className={`absolute top-full left-0 right-0 w-full h-[220px] pointer-events-none z-0 overflow-hidden ${className}`}>
            {children}
        </div>
    );

    // ==========================================
    // 🎨 تصميمات المناسبات المبهرة
    // ==========================================

    // 1. رمضان (هلال وفوانيس مضيئة) 🌙🏮
    if (activeTheme === 'ramadan') {
        return (
            <ThemeWrapper>
                <motion.div className="absolute top-0 left-6 md:left-16 origin-top flex flex-col items-center" animate={{ rotate: [0, 3, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="w-[1px] h-16 md:h-24 bg-gradient-to-b from-yellow-500/80 to-transparent"></div>
                    <PremiumIcons.Lantern />
                </motion.div>
                <motion.div className="absolute top-4 left-1/2 -translate-x-1/2 text-center flex flex-col items-center opacity-60 md:opacity-100" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                    <PremiumIcons.Crescent />
                    <p className="text-yellow-600/90 font-bold text-sm md:text-base mt-3 tracking-[0.2em] uppercase font-serif drop-shadow-sm">Ramadan Kareem</p>
                </motion.div>
                <motion.div className="absolute top-0 right-6 md:right-16 origin-top flex flex-col items-center" animate={{ rotate: [0, -4, 4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="w-[1px] h-10 md:h-16 bg-gradient-to-b from-yellow-500/80 to-transparent"></div>
                    <PremiumIcons.Lantern />
                </motion.div>
            </ThemeWrapper>
        );
    }

    // 2. عيد الفطر (بالونات ملونة تتطاير) 🎉🎈
    if (activeTheme === 'eid_fitr') {
        return (
            <ThemeWrapper>
                <motion.div className="absolute top-4 left-8 md:left-1/4 flex flex-col items-center" animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                    <PremiumIcons.Balloons />
                </motion.div>
                <motion.div className="absolute top-8 left-1/2 -translate-x-1/2 text-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <p className="text-primary font-bold text-base md:text-lg tracking-[0.2em] uppercase font-serif drop-shadow-sm">Happy Eid Al-Fitr</p>
                    <div className="mt-2 w-16 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
                </motion.div>
                <motion.div className="absolute top-2 right-8 md:right-1/4 flex flex-col items-center" animate={{ y: [0, -25, 0], rotate: [0, -5, 5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                    <PremiumIcons.Balloons />
                </motion.div>
            </ThemeWrapper>
        );
    }

    // 3. عيد الأضحى (كعبة وخروف وتكبيرات) 🕋🐑
    if (activeTheme === 'eid_adha') {
        return (
            <ThemeWrapper>
                <motion.div className="absolute top-4 left-6 md:left-20" animate={{ x: [0, 10, 0], y: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                    <PremiumIcons.Sheep />
                </motion.div>
                <motion.div className="absolute top-6 left-1/2 -translate-x-1/2 text-center flex flex-col items-center" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <PremiumIcons.Kaaba />
                    <p className="text-gray-800 dark:text-gray-200 font-bold text-sm md:text-base mt-3 tracking-[0.2em] uppercase font-serif drop-shadow-sm">Eid Al-Adha Mubarak</p>
                    <p className="text-xs text-gray-500 mt-1 font-script">Allahu Akbar</p>
                </motion.div>
                <motion.div className="absolute top-6 right-6 md:right-20" animate={{ x: [0, -10, 0], y: [0, -5, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                    <PremiumIcons.Sheep />
                </motion.div>
            </ThemeWrapper>
        );
    }

    // 4. الكريسماس الغربي (شجرة وثلج) 🎄❄️
    if (activeTheme === 'christmas') {
        return (
            <ThemeWrapper>
                <motion.div className="absolute top-4 left-8 md:left-24" animate={{ rotate: [0, 15, -15, 0], opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity }}>
                    <PremiumIcons.Snowflake />
                </motion.div>
                <motion.div className="absolute top-6 left-1/2 -translate-x-1/2 text-center flex flex-col items-center" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <PremiumIcons.Tree />
                    <p className="text-green-800 dark:text-green-500 font-bold text-sm md:text-base mt-3 tracking-[0.2em] uppercase font-serif drop-shadow-sm">Merry Christmas</p>
                </motion.div>
                <motion.div className="absolute top-8 right-8 md:right-24" animate={{ rotate: [0, -15, 15, 0], opacity: [0.7, 1, 0.7] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}>
                    <PremiumIcons.Snowflake />
                </motion.div>
            </ThemeWrapper>
        );
    }

    // 5. عيد الميلاد المجيد الشرقي (صليب ونجمة) 🌟⛪
    if (activeTheme === 'coptic_christmas') {
        return (
            <ThemeWrapper>
                <motion.div className="absolute top-4 left-1/2 -translate-x-1/2 text-center flex flex-col items-center" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <PremiumIcons.CopticCross />
                    <p className="text-yellow-600/90 font-bold text-sm md:text-base mt-3 tracking-[0.2em] uppercase font-serif drop-shadow-sm">Merry Christmas</p>
                </motion.div>
            </ThemeWrapper>
        );
    }

    // 6. عيد القيامة / شم النسيم (بيض وأرانب) 🌸🥚🐇
    if (activeTheme === 'easter') {
        return (
            <ThemeWrapper>
                <motion.div className="absolute top-4 left-6 md:left-20" animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <PremiumIcons.Bunny />
                </motion.div>
                <motion.div className="absolute top-8 left-1/2 -translate-x-1/2 text-center flex flex-col items-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                    <PremiumIcons.EasterEgg />
                    <p className="text-pink-600 dark:text-pink-400 font-bold text-sm md:text-base mt-3 tracking-[0.2em] uppercase font-serif drop-shadow-sm">Happy Easter & Sham El-Nessim</p>
                </motion.div>
                <motion.div className="absolute top-4 right-6 md:right-20" animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}>
                    <PremiumIcons.Flower />
                </motion.div>
            </ThemeWrapper>
        );
    }

    // 7. الفالنتاين (قلوب تنبض) ❤️💝
    if (activeTheme === 'valentine') {
        return (
            <ThemeWrapper>
                <motion.div className="absolute top-4 left-10 md:left-32" animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                    <PremiumIcons.Heart />
                </motion.div>
                <motion.div className="absolute top-10 left-1/2 -translate-x-1/2 text-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <p className="text-rose-600 dark:text-rose-400 font-bold text-sm md:text-base tracking-[0.2em] uppercase font-serif drop-shadow-sm">Happy Valentine's Day</p>
                    <p className="text-xs text-rose-400 mt-1 font-script">Love is in the air</p>
                </motion.div>
                <motion.div className="absolute top-4 right-10 md:right-32" animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
                    <PremiumIcons.Heart />
                </motion.div>
            </ThemeWrapper>
        );
    }

    // 8. عيد الأم (زهور وقلوب) 👩‍👧💐
    if (activeTheme === 'mothers_day') {
        return (
            <ThemeWrapper>
                <motion.div className="absolute top-4 left-8 md:left-24" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <PremiumIcons.Flower />
                </motion.div>
                <motion.div className="absolute top-8 left-1/2 -translate-x-1/2 text-center flex flex-col items-center" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <PremiumIcons.Heart />
                    <p className="text-pink-600 dark:text-pink-400 font-bold text-sm md:text-base mt-3 tracking-[0.2em] uppercase font-serif drop-shadow-sm">Happy Mother's Day</p>
                    <p className="text-xs text-pink-400 mt-1 font-script">To the world's best mom</p>
                </motion.div>
                <motion.div className="absolute top-4 right-8 md:right-24" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}>
                    <PremiumIcons.Flower />
                </motion.div>
            </ThemeWrapper>
        );
    }

    // 9. كذبة أبريل (قبعة المهرج المقلوبة) 🤡🃏
    if (activeTheme === 'april_fools') {
        return (
            <ThemeWrapper className="mix-blend-difference pointer-events-none">
                <motion.div className="absolute top-8 left-1/2 -translate-x-1/2 text-center flex flex-col items-center" animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}>
                    <PremiumIcons.JesterHat />
                    <p className="text-white font-bold text-lg md:text-xl mt-3 tracking-widest uppercase font-serif transform rotate-180">!sloof lirpA yppaH</p>
                </motion.div>
            </ThemeWrapper>
        );
    }

    return null;
};

export default SmartTheme;