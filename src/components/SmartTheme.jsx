import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// ==========================================
// 💎 مكتبة الأيقونات الفاخرة (Premium 3D SVGs)
// ==========================================
const PremiumIcons = {
    Crescent: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-14 md:h-14 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#goldGrad)" />
            <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="50%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#713F12" />
                </linearGradient>
            </defs>
        </svg>
    ),
    Lantern: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
            <path d="M12 2L6 6v2h12V6l-6-4zm-4 5v8l-2 3v2h12v-2l-2-3V7H8zm2 10V9h4v8h-4zm-1-7h6v1H9v-1zm0 3h6v1H9v-1z" fill="url(#goldGrad)" />
        </svg>
    ),
    Balloons: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-14 md:h-14 drop-shadow-lg">
            <path d="M9 4C7 4 5 6 5 8.5c0 2 1.5 4.5 4 7 2.5-2.5 4-5 4-7C13 6 11 4 9 4z" fill="#3B82F6" opacity="0.9" />
            <path d="M15 6c-1.5 0-3 1.5-3 3.5 0 1.5 1 3.5 3 5.5 2-2 3-4 3-5.5C18 7.5 16.5 6 15 6z" fill="#EF4444" opacity="0.9" />
            <path d="M9 15v5M15 14v6" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    Kaaba: () => (
        <svg viewBox="0 0 24 24" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-xl">
            <path d="M12 3l-8 4v10l8 4 8-4V7l-8-4z" fill="#111827" />
            <path d="M4 7l8 4 8-4M12 11v10" stroke="#374151" strokeWidth="1" />
            <path d="M5 8.5l7 3.5 7-3.5" stroke="url(#goldGrad)" strokeWidth="2" />
        </svg>
    ),
    Sheep: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md">
            <path d="M6 10c0-2.5 2-4.5 4.5-4.5S15 7.5 15 10v1.5h-9V10z" fill="#F3F4F6" />
            <path d="M16 12c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 2.2 1.3 4.2 3.2 5.2-.6.7-.9 1.7-.9 2.8 0 .6.1 1.1.4 1.6l1-1c-.1-.3-.2-.7-.2-1.1 0-.8.4-1.5.9-2.1.4.1.8.2 1.3.2 1.3 0 2.5-.5 3.3-1.3.8.8 2 1.3 3.3 1.3.4 0 .9-.1 1.3-.2.6.6.9 1.3.9 2.1 0 .4-.1.8-.2 1.1l1 1c.3-.5.4-1 .4-1.6 0-1.1-.3-2.1-.9-2.8 1.8-1 3.2-3 3.2-5.2z" fill="#D1D5DB" />
            <path d="M10.5 18c0 .8-.7 1.5-1.5 1.5S7.5 18.8 7.5 18v-1.5h3V18zm6 0c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-1.5h3V18z" fill="#374151" />
        </svg>
    ),
    Tree: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-14 md:h-14 drop-shadow-lg">
            <path d="M12 2L4 12h3l-3 8h16l-3-8h3L12 2z" fill="#10B981" />
            <path d="M11 20h2v4h-2z" fill="#78350F" />
            <circle cx="12" cy="3" r="1.5" fill="#FDE047" />
        </svg>
    ),
    Snowflake: () => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md text-blue-200" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1L19.1 4.9" />
        </svg>
    ),
    CopticCross: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
            <path d="M11 2h2v6h6v2h-6v12h-2V10H5V8h6V2z" fill="url(#goldGrad)" />
            <circle cx="12" cy="12" r="2.5" stroke="#B45309" strokeWidth="1" fill="none" />
        </svg>
    ),
    EasterEgg: () => (
        <svg viewBox="0 0 24 32" className="w-8 h-12 md:w-10 md:h-14 drop-shadow-md">
            <path d="M12 2C6.5 2 2 9 2 17s4.5 13 10 13 10-7 10-13S17.5 2 12 2z" fill="#F472B6" />
            <path d="M2 17c0-1.5 2.5-2 5-2s5 1 5 2 2.5 2 5 2 5-1 5-2" stroke="#FFF" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="22" r="1.5" fill="#FFF" />
        </svg>
    ),
    Heart: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-14 md:h-14 drop-shadow-[0_0_15px_rgba(225,29,72,0.6)]">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#E11D48" />
        </svg>
    ),
    Flower: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md">
            <path d="M12 2c-1.1 0-2 .9-2 2v2c-2.2 0-4 1.8-4 4s1.8 4 4 4v8h4v-8c2.2 0 4-1.8 4-4s-1.8-4-4-4V4c0-1.1-.9-2-2-2z" fill="#F472B6" />
            <circle cx="12" cy="10" r="2" fill="#FDE047" />
        </svg>
    ),
    Jester: () => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md">
            <path d="M12 2l-3 6H5l2 4-4 4 4 2v4h10v-4l4-2-4-4 2-4h-4l-3-6z" fill="#8B5CF6" />
            <circle cx="5" cy="12" r="1.5" fill="#FDE047" />
            <circle cx="19" cy="12" r="1.5" fill="#FDE047" />
            <circle cx="12" cy="22" r="1.5" fill="#FDE047" />
        </svg>
    ),
};

const SmartTheme = () => {
    const [activeTheme, setActiveTheme] = useState(null);

    useEffect(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const m = today.getMonth() + 1;
        const d = today.getDate();
        const currentGregorian = m * 100 + d;

        // 1. حساب التاريخ الميلادي الثابت
        const isBetween = (start, end) => currentGregorian >= start && currentGregorian <= end;

        // 2. حساب التاريخ الهجري الأوتوماتيكي (ديناميكي للأبد)
        const hijri = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric', day: 'numeric' }).formatToParts(today);
        let hM = 0; let hD = 0;
        hijri.forEach(p => { if (p.type === 'month') hM = parseInt(p.value, 10); if (p.type === 'day') hD = parseInt(p.value, 10); });

        // 3. خوارزمية فلكية لحساب عيد القيامة الشرقي وشم النسيم أوتوماتيك لحد سنة 2099!
        const getEasterLimits = (year) => {
            const a = year % 19; const b = year % 4; const c = year % 7;
            const k = (19 * a + 15) % 30; const e = (2 * b + 4 * c - k + 34) % 7;
            const julianMonth = Math.floor((k + e + 114) / 31);
            const julianDay = ((k + e + 114) % 31) + 1;

            // تحويل للتقويم الميلادي (بإضافة 13 يوم)
            const easterDate = new Date(year, julianMonth - 1, julianDay);
            easterDate.setDate(easterDate.getDate() + 13);

            // بداية الزينة: قبل العيد بـ 10 أيام
            const startTheme = new Date(easterDate);
            startTheme.setDate(startTheme.getDate() - 10);

            // نهاية الزينة: بعد شم النسيم بـ يومين
            const endTheme = new Date(easterDate);
            endTheme.setDate(endTheme.getDate() + 3);

            return { start: startTheme, end: endTheme };
        };

        const easterLimits = getEasterLimits(currentYear);
        const isEasterTime = today >= easterLimits.start && today <= easterLimits.end;


        // ==========================================
        // 🗓️ العقل المدبر: تحديد المناسبة الحالية
        // ==========================================

        // الأعياد المتغيرة:
        if (hM === 9) setActiveTheme('ramadan');
        else if (hM === 10 && hD >= 1 && hD <= 5) setActiveTheme('eid_fitr'); // 5 أيام زينة للعيد
        else if (hM === 12 && hD >= 9 && hD <= 15) setActiveTheme('eid_adha'); // من عرفة لرابع يوم
        else if (isEasterTime) setActiveTheme('easter'); // عيد القيامة وشم النسيم ديناميك

        // الأعياد الثابتة:
        else if (isBetween(401, 401)) setActiveTheme('april_fools');
        else if (isBetween(320, 322)) setActiveTheme('mothers_day'); // 20 لـ 22 مارس
        else if (isBetween(105, 108)) setActiveTheme('coptic_christmas'); // 5 لـ 8 يناير
        else if (isBetween(1220, 1231) || isBetween(101, 102)) setActiveTheme('christmas'); // 20 ديسمبر لـ 2 يناير
        else if (isBetween(213, 215) || isBetween(1103, 1105)) setActiveTheme('valentine');

        // الأيام العادية:
        else setActiveTheme(null);

    }, []);

    if (!activeTheme) return null;

    // المكون الخاص بالعنصر المتعلق (حبل + أيقونة بتمرجح)
    const HangingItem = ({ Icon, position, delay = 0, swing = 5, length = "h-8 md:h-12" }) => (
        <motion.div
            className={`absolute top-0 ${position} origin-top flex flex-col items-center pointer-events-none`}
            animate={{ rotate: [0, swing, -swing, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
        >
            <div className={`w-[1.5px] ${length} bg-gradient-to-b from-gray-400/50 to-transparent`}></div>
            <div className="-mt-1"><Icon /></div>
        </motion.div>
    );

    // ==========================================
    // 🎨 عرض التصميمات
    // ==========================================
    return (
        <div className="absolute top-full left-0 right-0 w-full h-[150px] pointer-events-none z-0 overflow-hidden">
            {activeTheme === 'ramadan' && (
                <>
                    <HangingItem Icon={PremiumIcons.Lantern} position="left-4 md:left-12" swing={4} length="h-12 md:h-16" />
                    <HangingItem Icon={PremiumIcons.Crescent} position="right-4 md:right-12" swing={-4} length="h-8 md:h-12" delay={0.5} />
                </>
            )}

            {activeTheme === 'eid_fitr' && (
                <>
                    <HangingItem Icon={PremiumIcons.Balloons} position="left-6 md:left-16" swing={6} length="h-6 md:h-10" />
                    <HangingItem Icon={PremiumIcons.Balloons} position="right-6 md:right-16" swing={-5} length="h-10 md:h-14" delay={0.3} />
                </>
            )}

            {activeTheme === 'eid_adha' && (
                <>
                    <HangingItem Icon={PremiumIcons.Kaaba} position="left-6 md:left-16" swing={3} length="h-8" />
                    <HangingItem Icon={PremiumIcons.Sheep} position="right-6 md:right-16" swing={-4} length="h-12" delay={0.5} />
                </>
            )}

            {activeTheme === 'christmas' && (
                <>
                    <HangingItem Icon={PremiumIcons.Tree} position="left-4 md:left-12" swing={3} length="h-8 md:h-12" />
                    <HangingItem Icon={PremiumIcons.Snowflake} position="right-4 md:right-12" swing={-5} length="h-12 md:h-16" delay={0.5} />
                </>
            )}

            {activeTheme === 'coptic_christmas' && (
                <>
                    <HangingItem Icon={PremiumIcons.CopticCross} position="left-6 md:left-16" swing={4} length="h-10" />
                    <HangingItem Icon={PremiumIcons.CopticCross} position="right-6 md:right-16" swing={-4} length="h-8" delay={0.5} />
                </>
            )}

            {activeTheme === 'easter' && (
                <>
                    <HangingItem Icon={PremiumIcons.EasterEgg} position="left-6 md:left-16" swing={5} length="h-8 md:h-12" />
                    <HangingItem Icon={PremiumIcons.Flower} position="right-6 md:right-16" swing={-4} length="h-10 md:h-14" delay={0.4} />
                </>
            )}

            {activeTheme === 'valentine' && (
                <>
                    <motion.div className="absolute top-4 left-6 md:left-16" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <PremiumIcons.Heart />
                    </motion.div>
                    <motion.div className="absolute top-8 right-6 md:right-16" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                        <PremiumIcons.Heart />
                    </motion.div>
                </>
            )}

            {activeTheme === 'mothers_day' && (
                <>
                    <HangingItem Icon={PremiumIcons.Flower} position="left-6 md:left-16" swing={4} length="h-10" />
                    <HangingItem Icon={PremiumIcons.Heart} position="right-6 md:right-16" swing={-4} length="h-8" delay={0.5} />
                </>
            )}

            {activeTheme === 'april_fools' && (
                <>
                    <HangingItem Icon={PremiumIcons.Jester} position="left-10 md:left-24" swing={8} length="h-6" />
                    <HangingItem Icon={PremiumIcons.Jester} position="right-10 md:right-24" swing={-8} length="h-12" delay={0.5} />
                </>
            )}
        </div>
    );
};

export default SmartTheme;