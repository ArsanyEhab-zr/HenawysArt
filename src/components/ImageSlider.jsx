import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

// خرجنا الـ variants بره عشان الأداء والأنيميشن يظبط
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%', // استخدام % أفضل من الـ pixels
    opacity: 0,
    zIndex: 0,
    scale: 0.95
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95
  })
}

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [imgError, setImgError] = useState(false) // عشان لو الصورة بايظة نعرف

  // زيادة تأكيد: تنظيف الروابط جوه السلايدر نفسه
  const cleanImages = images.map(img => img ? img.trim() : "");

  // لو مفيش صور أصلاً، نرجع فاضي
  if (!cleanImages || cleanImages.length === 0) return null;

  const nextImage = () => {
    setDirection(1)
    setImgError(false) // ريسيت للخطأ مع الصورة الجديدة
    setCurrentIndex((prev) => (prev + 1 === cleanImages.length ? 0 : prev + 1))
  }

  const prevImage = () => {
    setDirection(-1)
    setImgError(false)
    setCurrentIndex((prev) => (prev - 1 < 0 ? cleanImages.length - 1 : prev - 1))
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-gray-100 group">
      <AnimatePresence initial={false} custom={direction} mode='popLayout'>
        {imgError ? (
            // لو الرابط بايظ هيظهر الشكل ده بدل الرمادي
            <motion.div 
                key="error"
                className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
                <ImageOff size={32} />
                <span className="text-xs mt-2">Image Not Found</span>
            </motion.div>
        ) : (
            <motion.img
            key={currentIndex} // المفتاح هو الاندكس عشان الرياكت يعرف إن الصورة اتغيرت
            src={cleanImages[currentIndex]}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }}
            className="absolute top-0 left-0 w-full h-full object-cover"
            alt="Product"
            onError={(e) => {
                console.error("Failed to load image:", cleanImages[currentIndex]);
                setImgError(true); // قولنا إن الصورة دي بايظة
            }}
            />
        )}
      </AnimatePresence>

      {/* الأسهم تظهر بس لو فيه أكتر من صورة */}
      {cleanImages.length > 1 && (
        <>
            <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white cursor-pointer"
            >
                <ChevronRight size={20} className="text-primary" />
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white cursor-pointer"
            >
                <ChevronLeft size={20} className="text-primary" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {cleanImages.map((_, index) => (
                <button
                    key={index}
                    onClick={(e) => {
                        e.stopPropagation();
                        setDirection(index > currentIndex ? 1 : -1)
                        setImgError(false);
                        setCurrentIndex(index)
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                        index === currentIndex ? "bg-white w-6" : "bg-white/60 w-1.5 hover:bg-white"
                    }`}
                />
                ))}
            </div>
        </>
      )}
    </div>
  )
}

export default ImageSlider