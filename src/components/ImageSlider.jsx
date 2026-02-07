import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

// إعدادات الحركة (مبسطة ومضمونة عشان الصور متختفيش)
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    position: 'absolute' 
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    position: 'absolute'
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    position: 'absolute'
  })
}

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [imgError, setImgError] = useState(false)

  // 1. تنظيف وتجهيز الصور (عشان المسافات والأقواس) 🧹
  const cleanImages = (images || [])
    .map(img => typeof img === 'string' ? img.trim() : "")
    .filter(img => img.length > 5); // استبعاد الروابط القصيرة أو الفاضية

  // لو مفيش صور، نرجع فاضي
  if (cleanImages.length === 0) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    setDirection(1)
    setImgError(false)
    setCurrentIndex((prev) => (prev + 1 === cleanImages.length ? 0 : prev + 1))
  }

  const prevImage = (e) => {
    e.stopPropagation();
    setDirection(-1)
    setImgError(false)
    setCurrentIndex((prev) => (prev - 1 < 0 ? cleanImages.length - 1 : prev - 1))
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-gray-100 group">
      <AnimatePresence initial={false} custom={direction}>
        {imgError ? (
            <motion.div 
                key="error"
                className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 z-10"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
                <ImageOff size={32} />
                <span className="text-xs mt-2">Image Error</span>
            </motion.div>
        ) : (
            <motion.img
            key={currentIndex}
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
                console.error("Failed to load:", cleanImages[currentIndex]);
                setImgError(true);
            }}
            />
        )}
      </AnimatePresence>

      {/* أزرار التحكم - تظهر فقط لو فيه أكثر من صورة */}
      {cleanImages.length > 1 && (
        <>
            <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white cursor-pointer"
            >
                <ChevronRight size={20} className="text-primary" />
            </button>

            <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white cursor-pointer"
            >
                <ChevronLeft size={20} className="text-primary" />
            </button>

            {/* Dots Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
                {cleanImages.map((_, index) => (
                <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                        index === currentIndex ? "bg-white w-6" : "bg-white/60 w-1.5"
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