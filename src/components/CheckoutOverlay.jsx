import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

/**
 * CheckoutOverlay — A cinematic fullscreen overlay for order submission.
 *
 * States:
 * - 'processing' → blurred backdrop + animated spinner + "Processing your masterpiece..."
 * - 'success'    → checkmark animation + "Order prepared successfully!"
 * - null         → hidden
 *
 * Usage: <CheckoutOverlay stage={stage} />
 * where stage is 'processing' | 'success' | null
 */
const CheckoutOverlay = ({ stage }) => {
    return (
        <AnimatePresence>
            {stage && (
                <motion.div
                    key="checkout-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center"
                    style={{ perspective: '1000px' }}
                >
                    {/* Backdrop with heavy blur */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

                    {/* Radial glow behind the card */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
                        style={{
                            background: stage === 'success'
                                ? 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                        }}
                    />

                    {/* Content Card */}
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="relative z-10 flex flex-col items-center text-center px-8 py-12 max-w-sm w-full mx-4"
                    >
                        <AnimatePresence mode="wait">
                            {stage === 'processing' && (
                                <motion.div
                                    key="processing"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex flex-col items-center"
                                >
                                    {/* Animated spinner rings */}
                                    <div className="relative w-24 h-24 mb-8">
                                        {/* Outer ring */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 rounded-full border-2 border-transparent"
                                            style={{
                                                borderTopColor: 'rgba(139,92,246,0.8)',
                                                borderRightColor: 'rgba(139,92,246,0.3)',
                                            }}
                                        />
                                        {/* Middle ring */}
                                        <motion.div
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-2 rounded-full border-2 border-transparent"
                                            style={{
                                                borderBottomColor: 'rgba(251,191,36,0.8)',
                                                borderLeftColor: 'rgba(251,191,36,0.3)',
                                            }}
                                        />
                                        {/* Inner ring */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-4 rounded-full border-2 border-transparent"
                                            style={{
                                                borderTopColor: 'rgba(59,130,246,0.8)',
                                                borderRightColor: 'rgba(59,130,246,0.3)',
                                            }}
                                        />
                                        {/* Center dot */}
                                        <motion.div
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Sparkles size={24} className="text-violet-400" />
                                        </motion.div>
                                    </div>

                                    {/* Text */}
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-xl font-bold text-white mb-2"
                                    >
                                        Processing your masterpiece...
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-gray-400"
                                    >
                                        ✨ جاري تجهيز طلبك...
                                    </motion.p>

                                    {/* Floating dots animation */}
                                    <div className="flex gap-1.5 mt-6">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    delay: i * 0.2,
                                                }}
                                                className="w-2 h-2 rounded-full bg-violet-400"
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {stage === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                                    className="flex flex-col items-center"
                                >
                                    {/* Success checkmark with ring */}
                                    <div className="relative w-24 h-24 mb-8">
                                        {/* Expanding ring */}
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute inset-0 rounded-full border-4 border-emerald-400/40"
                                        />
                                        {/* Pulsing glow */}
                                        <motion.div
                                            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-md"
                                        />
                                        {/* Check icon */}
                                        <motion.div
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-green-500 rounded-full shadow-lg shadow-emerald-500/40"
                                        >
                                            <CheckCircle2 size={40} className="text-white" strokeWidth={2.5} />
                                        </motion.div>
                                    </div>

                                    {/* Success text */}
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-xl font-bold text-white mb-2"
                                    >
                                        Order prepared successfully!
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-sm text-gray-400 mb-2"
                                    >
                                        🎨 تم تجهيز الأوردر بنجاح!
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-xs text-gray-500"
                                    >
                                        Redirecting to WhatsApp...
                                    </motion.p>

                                    {/* Confetti-like particles */}
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                        {[...Array(8)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{
                                                    x: 0,
                                                    y: 0,
                                                    opacity: 0,
                                                    scale: 0,
                                                }}
                                                animate={{
                                                    x: (Math.random() - 0.5) * 200,
                                                    y: (Math.random() - 0.5) * 200,
                                                    opacity: [0, 1, 0],
                                                    scale: [0, 1.5, 0],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    delay: i * 0.1,
                                                    ease: 'easeOut',
                                                }}
                                                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                                                style={{
                                                    background: [
                                                        '#fbbf24', '#34d399', '#818cf8',
                                                        '#f472b6', '#60a5fa', '#a78bfa',
                                                        '#fb923c', '#4ade80',
                                                    ][i],
                                                }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutOverlay;
