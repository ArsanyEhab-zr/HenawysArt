import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
    const [isArabic, setIsArabic] = useState(false);

    useEffect(() => {
        // 1. تعريف دالة جوجل المطلوبة
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en', // لغة الموقع الأصلية
                    includedLanguages: 'en,ar', // اللغات المسموحة
                    autoDisplay: false,
                },
                'google_translate_element'
            );
        };

        // 2. التحقق من اللغة الحالية من الكوكيز
        const cookies = document.cookie.split(';');
        const transCookie = cookies.find(c => c.trim().startsWith('googtrans='));
        if (transCookie && transCookie.includes('/ar')) {
            setIsArabic(true);
            document.body.dir = 'rtl'; // قلب الموقع يمين
        } else {
            setIsArabic(false);
            document.body.dir = 'ltr'; // قلب الموقع شمال
        }
    }, []);

    const toggleLanguage = () => {
        // الحل السحري: بنغير الكوكيز ونعمل ريلود
        if (isArabic) {
            // تحويل للإنجليزي
            document.cookie = "googtrans=/en/en; path=/";
            document.cookie = "googtrans=/en/en; domain=.henawys-art.vercel.app; path=/"; // عدل الدومين لما ترفع
            window.location.reload();
        } else {
            // تحويل للعربي
            document.cookie = "googtrans=/en/ar; path=/";
            document.cookie = "googtrans=/en/ar; domain=.henawys-art.vercel.app; path=/";
            window.location.reload();
        }
    };

    return (
        <>
            {/* عنصر مخفي لازم يكون موجود عشان جوجل يشتغل عليه */}
            <div id="google_translate_element" className="hidden"></div>

            {/* الزرار بتاعنا */}
            <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-bold text-gray-700 border border-gray-200"
            >
                <Globe size={16} />
                {isArabic ? 'English' : 'عربي'}
            </button>
        </>
    );
};

export default LanguageToggle;