import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Loader2, CheckCircle2, Paintbrush, Truck, XCircle, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import useBackButton from '../hooks/useBackButton';

const OrderTracker = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Intercept mobile back gesture to close tracker popup instead of navigating away
    useBackButton(isOpen, () => setIsOpen(false), 'order-tracker');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trackedPhone, setTrackedPhone] = useState('');

    useEffect(() => {
        const phone = localStorage.getItem('henawy_tracked_phone');
        if (phone) {
            setTrackedPhone(phone);
            fetchLatestOrder(phone);

            // ==========================================
            // 🚀 التحديث اللحظي (Realtime) السريع جداً وموفر للباقة
            // ==========================================
            const orderSubscription = supabase.channel(`tracker-${phone}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `phone=eq.${phone}` // العميل بيراقب تليفونه بس!
                    },
                    (payload) => {
                        console.log("Order updated!", payload.new);
                        setOrder(payload.new); // تحديث فوري بدون ريفرش
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(orderSubscription);
            };
        }
    }, []);

    const fetchLatestOrder = async (phone) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('id, status, created_at, items')
                .eq('phone', phone)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!error && data) setOrder(data);
        } catch (error) {
            console.error("Error fetching order");
        } finally {
            setLoading(false);
        }
    };

    if (!trackedPhone) return null;

    // المراحل متطابقة تماماً مع الداش بورد بتاعتك
    const statuses = [
        { id: 'pending', label: 'Pending', icon: Clock, desc: 'Order received & waiting for review' },
        { id: 'confirmed', label: 'Confirmed & Making', icon: Paintbrush, desc: 'Your art is being created!' },
        { id: 'shipped', label: 'Out for Delivery', icon: Truck, desc: 'Your package is on the way' },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Enjoy your art!' }
    ];

    // 👇 المترجم الذكي: بياخد الجملة اللي في الداش بورد وبيفهمها 👇
    const mapStatus = (dbStatus) => {
        if (!dbStatus) return 'pending';
        const s = dbStatus.toLowerCase();

        // بيقرا الكلمة الإنجليزي أو العربي اللي إنت مختارها من القائمة
        if (s.includes('pending') || s.includes('قيد')) return 'pending';
        if (s.includes('confirmed') || s.includes('مؤكد')) return 'confirmed';
        if (s.includes('shipped') || s.includes('شحن')) return 'shipped';
        if (s.includes('delivered') || s.includes('توصيل')) return 'delivered';
        if (s.includes('cancelled') || s.includes('ملغي')) return 'cancelled';

        return 'pending';
    };

    const currentStatusId = order ? mapStatus(order.status) : 'pending';
    const isCancelled = currentStatusId === 'cancelled';
    const currentIndex = statuses.findIndex(s => s.id === currentStatusId);

    return (
        <>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-40 bg-gray-900 text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-accent"
            >
                <Package size={24} className={currentStatusId !== 'delivered' && !isCancelled ? "animate-bounce" : ""} />
                {currentStatusId !== 'delivered' && !isCancelled && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 left-6 z-50 w-[300px] md:w-[320px] bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300"
                    >
                        <div className="bg-gray-900 dark:bg-[#1e293b] p-4 flex justify-between items-center text-white transition-colors duration-300">
                            <h3 className="font-bold flex items-center gap-2">
                                <Package size={18} className="text-accent" /> Track Your Order
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5">
                            {loading && !order ? (
                                <div className="flex justify-center p-6"><Loader2 className="animate-spin text-accent" size={30} /></div>
                            ) : !order ? (
                                <div className="text-center p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent orders found.</p>
                                </div>
                            ) : isCancelled ? (
                                <div className="text-center p-4">
                                    <XCircle size={48} className="mx-auto text-red-500 mb-3 drop-shadow-sm" />
                                    <h4 className="font-bold text-lg text-red-600">Order Cancelled</h4>
                                    <p className="text-xs text-gray-500 mt-1">Please contact support for details.</p>
                                </div>
                            ) : (
                                <div className="space-y-0 relative ml-2 mt-2">
                                    <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-gray-100 dark:bg-gray-800 z-0"></div>
                                    <motion.div
                                        className="absolute left-[15px] top-2 w-0.5 bg-accent z-0"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                    ></motion.div>

                                    {statuses.map((status, index) => {
                                        const isCompleted = index <= currentIndex;
                                        const isCurrent = index === currentIndex;
                                        const Icon = status.icon;

                                        return (
                                            <div key={status.id} className="relative z-10 flex gap-5 pb-8 last:pb-2">
                                                <motion.div
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500
                                                        ${isCompleted ? 'bg-accent border-accent text-gray-900 shadow-md' : 'bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-500'}
                                                        ${isCurrent ? 'ring-4 ring-accent/20' : ''}
                                                    `}
                                                >
                                                    <Icon size={14} strokeWidth={isCompleted ? 2.5 : 2} />
                                                </motion.div>
                                                <div className="pt-1.5">
                                                    <h4 className={`text-sm font-bold transition-colors duration-300 ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                                        {status.label}
                                                    </h4>
                                                    <p className={`text-[11px] mt-0.5 transition-colors duration-300 ${isCurrent ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-600'}`}>
                                                        {status.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                onClick={() => { localStorage.removeItem('henawy_tracked_phone'); setIsOpen(false); setTrackedPhone(''); }}
                                className="w-full mt-6 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors border-t border-gray-100 dark:border-gray-800"
                            >
                                Stop Tracking & Clear
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default OrderTracker;