import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
    const [isArabic, setIsArabic] = useState(false);

    useEffect(() => {
        // التحقق من الكوكيز فقط لتحديد اتجاه الصفحة وشكل الزرار
        const cookies = document.cookie.split(';');
        const transCookie = cookies.find(c => c.trim().startsWith('googtrans='));

        if (transCookie && transCookie.includes('/ar')) {
            setIsArabic(true);
            document.body.dir = 'rtl';
            document.body.style.fontFamily = "'Cairo', sans-serif"; // تغيير الخط للعربي
        } else {
            setIsArabic(false);
            document.body.dir = 'ltr';
            document.body.style.fontFamily = "inherit";
        }
    }, []);

    const toggleLanguage = () => {
        if (isArabic) {
            // تحويل للإنجليزي
            document.cookie = "googtrans=/en/en; path=/";
            document.cookie = "googtrans=/en/en; domain=" + window.location.hostname + "; path=/";
            window.location.reload();
        } else {
            // تحويل للعربي
            document.cookie = "googtrans=/en/ar; path=/";
            document.cookie = "googtrans=/en/ar; domain=" + window.location.hostname + "; path=/";
            window.location.reload();
        }
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        >
            <Globe size={16} />
            {isArabic ? 'English' : 'عربي'}
        </button>
    );
};

export default LanguageToggle;