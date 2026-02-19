import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const SmartTheme = () => {
    const [activeTheme, setActiveTheme] = useState(null);

    useEffect(() => {
        const today = new Date();

        // 1. حساب التاريخ الميلادي الثابت
        const m = today.getMonth() + 1;
        const d = today.getDate();
        const currentGregorian = m * 100 + d;
        const isBetween = (start, end) => currentGregorian >= start && currentGregorian <= end;

        // 2. حساب التاريخ الهجري الديناميكي (عشان رمضان والأعياد)
        const hijriDateFormatter = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric', day: 'numeric' });
        const hijriParts = hijriDateFormatter.formatToParts(today);

        let hijriMonth = 0;
        let hijriDay = 0;

        hijriParts.forEach(part => {
            if (part.type === 'month') hijriMonth = parseInt(part.value, 10);
            if (part.type === 'day') hijriDay = parseInt(part.value, 10);
        });

        // ==========================================
        // 🗓️ أجندة المناسبات (ديناميكية للأبد)
        // ==========================================

        // أولاً: المناسبات الهجرية (المتغيرة كل سنة)
        // رمضان: الشهر الهجري رقم 9
        if (hijriMonth === 9) {
            setActiveTheme('ramadan');
        }
        // عيد الفطر: من 1 إلى 3 شوال (الشهر 10)
        else if (hijriMonth === 10 && hijriDay >= 1 && hijriDay <= 3) {
            setActiveTheme('eid_fitr');
        }
        // عيد الأضحى: من 10 إلى 13 ذو الحجة (الشهر 12)
        else if (hijriMonth === 12 && hijriDay >= 10 && hijriDay <= 13) {
            setActiveTheme('eid_adha');
        }

        // ثانياً: المناسبات الميلادية (الثابتة)
        else if (isBetween(401, 401)) setActiveTheme('april_fools');
        else if (isBetween(321, 321)) setActiveTheme('mothers_day');
        // عيد القيامة المجيد وشم النسيم (غالباً في النصف الأول من أبريل)
        else if (isBetween(405, 420)) setActiveTheme('easter');
        // عيد الميلاد المجيد الشرقي (6 لـ 8 يناير)
        else if (isBetween(106, 108)) setActiveTheme('coptic_christmas');
        // الكريسماس ورأس السنة (24 ديسمبر لـ 2 يناير)
        else if (isBetween(1224, 1231) || isBetween(101, 102)) setActiveTheme('christmas');
        // الفالنتاين (13-15 فبراير) أو المصري (3-5 نوفمبر)
        else if (isBetween(213, 215) || isBetween(1103, 1105)) setActiveTheme('valentine');

        // الأيام العادية
        else {
            setActiveTheme(null);
        }

    }, []);

    if (!activeTheme) return null;

    // ==========================================
    // 🎨 تصميمات المناسبات
    // ==========================================

    // 1. تصميم رمضان 🌙🏮
    if (activeTheme === 'ramadan') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-0 left-4 md:left-12 origin-top" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="w-[2px] h-12 md:h-16 bg-gradient-to-b from-yellow-500/50 to-yellow-600/80 mx-auto"></div>
                    <div className="text-4xl md:text-5xl drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">🏮</div>
                </motion.div>
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center opacity-30 md:opacity-100" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="text-3xl md:text-4xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">🌙 ✨</div>
                    <p className="text-yellow-600/80 font-bold text-xs md:text-sm mt-1 font-script">Ramadan Kareem</p>
                </motion.div>
                <motion.div className="absolute top-0 right-4 md:right-12 origin-top" animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="w-[2px] h-8 md:h-12 bg-gradient-to-b from-yellow-500/50 to-yellow-600/80 mx-auto"></div>
                    <div className="text-3xl md:text-4xl drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">🏮</div>
                </motion.div>
            </div>
        );
    }

    // 2. تصميم عيد الفطر 🎉🍬
    if (activeTheme === 'eid_fitr') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-2 left-8 md:left-1/4" animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="w-[1px] h-12 bg-gray-300 mx-auto"></div>
                    <div className="text-4xl drop-shadow-md">🎈</div>
                </motion.div>
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="text-3xl md:text-4xl drop-shadow-md">✨ 🍬 ✨</div>
                    <p className="text-primary font-bold text-xs md:text-sm mt-1 font-script">Happy Eid</p>
                </motion.div>
                <motion.div className="absolute top-0 right-8 md:right-1/4" animate={{ y: [0, -20, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                    <div className="w-[1px] h-16 bg-gray-300 mx-auto"></div>
                    <div className="text-4xl drop-shadow-md">🎈</div>
                </motion.div>
            </div>
        );
    }

    // 3. تصميم عيد الأضحى 🐑🕋
    if (activeTheme === 'eid_adha') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-6 left-6 md:left-20" animate={{ x: [0, 10, 0], y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="text-4xl md:text-5xl drop-shadow-md">🐑</div>
                </motion.div>
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="text-3xl md:text-4xl drop-shadow-md">🕋 ✨</div>
                    <p className="text-primary font-bold text-xs md:text-sm mt-1 font-script">Happy Eid Al-Adha</p>
                </motion.div>
                <motion.div className="absolute top-6 right-6 md:right-20" animate={{ x: [0, -10, 0], y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                    <div className="text-4xl md:text-5xl drop-shadow-md">🐑</div>
                </motion.div>
            </div>
        );
    }

    // 4. الكريسماس الغربي ورأس السنة 🎄⛄
    if (activeTheme === 'christmas') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-4 left-6 md:left-20" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                    <div className="text-4xl md:text-5xl drop-shadow-md">❄️</div>
                </motion.div>
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <div className="text-3xl md:text-4xl drop-shadow-md">🎄 🎁</div>
                    <p className="text-red-600/80 font-bold text-xs md:text-sm mt-1 font-script">Merry Christmas</p>
                </motion.div>
                <motion.div className="absolute top-4 right-6 md:right-20" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 6, repeat: Infinity }}>
                    <div className="text-4xl md:text-5xl drop-shadow-md">⛄</div>
                </motion.div>
            </div>
        );
    }

    // 5. عيد الميلاد المجيد (الشرقي) 🌟⛪
    if (activeTheme === 'coptic_christmas') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-4 left-6 md:left-20" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>
                    <div className="text-4xl md:text-5xl drop-shadow-md">🌟</div>
                </motion.div>
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <div className="text-3xl md:text-4xl drop-shadow-md">⛪ 🕊️</div>
                    <p className="text-yellow-600/80 font-bold text-xs md:text-sm mt-1 font-script">Merry Christmas</p>
                </motion.div>
                <motion.div className="absolute top-4 right-6 md:right-20" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
                    <div className="text-4xl md:text-5xl drop-shadow-md">🌟</div>
                </motion.div>
            </div>
        );
    }

    // 6. عيد القيامة / شم النسيم 🌸🥚
    if (activeTheme === 'easter') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-4 left-6 md:left-20" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <div className="text-4xl md:text-5xl drop-shadow-md">🌸</div>
                </motion.div>
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }}>
                    <div className="flex gap-2 justify-center text-3xl md:text-4xl drop-shadow-md"><span>🕊️</span><span>🥚</span><span>🌿</span></div>
                    <p className="text-pink-600/80 font-bold text-xs md:text-sm mt-1 font-script">Happy Easter</p>
                </motion.div>
                <motion.div className="absolute top-4 right-6 md:right-20" animate={{ y: [0, -15, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
                    <div className="text-4xl md:text-5xl drop-shadow-md">🐣</div>
                </motion.div>
            </div>
        );
    }

    // 7. الفالنتاين ❤️💝
    if (activeTheme === 'valentine') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-4 left-10 md:left-32" animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>
                    <div className="text-3xl drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">💖</div>
                </motion.div>
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <div className="text-4xl drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">❤️</div>
                    <p className="text-red-600 font-bold text-xs md:text-sm mt-1 font-script">Happy Valentine's</p>
                </motion.div>
                <motion.div className="absolute top-4 right-10 md:right-32" animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}>
                    <div className="text-3xl drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">💘</div>
                </motion.div>
            </div>
        );
    }

    // 8. عيد الأم 👩‍👧💐
    if (activeTheme === 'mothers_day') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-4 left-6 md:left-20" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    <div className="text-4xl drop-shadow-md">💐</div>
                </motion.div>
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <div className="text-3xl md:text-4xl drop-shadow-md">👑 ❤️</div>
                    <p className="text-pink-600 font-bold text-xs md:text-sm mt-1 font-script">Happy Mother's Day</p>
                </motion.div>
                <motion.div className="absolute top-4 right-6 md:right-20" animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}>
                    <div className="text-4xl drop-shadow-md">💐</div>
                </motion.div>
            </div>
        );
    }

    // 9. كذبة أبريل 🤡 (حركة مضحكة بتتشقلب)
    if (activeTheme === 'april_fools') {
        return (
            <div className="fixed top-0 left-0 right-0 z-[40] pointer-events-none overflow-hidden h-64">
                <motion.div className="absolute top-[80px] md:top-6 left-1/2 -translate-x-1/2 text-center" animate={{ rotate: [0, 180, 360] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
                    <div className="text-4xl drop-shadow-md">🤡</div>
                </motion.div>
            </div>
        );
    }

    return null;
};

export default SmartTheme;