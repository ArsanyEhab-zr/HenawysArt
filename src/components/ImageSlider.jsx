import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

const variants = {
  enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
}

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // تنظيف الروابط والتأكد إنها مش null أو فاضية
  const cleanImages = (images || []).map(img => img?.trim()).filter(Boolean);

  // لو مفيش صور خالص، اعرض شكل جمالي (Placeholder)
  if (!cleanImages.length) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
        <ImageIcon size={48} className="mb-2 opacity-50" />
        <span className="text-xs">No images available</span>
      </div>
    );
  }

  const nextImage = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1 === cleanImages.length ? 0 : prev + 1))
  }

  const prevImage = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 < 0 ? cleanImages.length - 1 : prev - 1))
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100 group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          src={cleanImages[currentIndex]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="absolute top-0 left-0 w-full h-full object-cover"
          // لو الصورة فشلت في التحميل، نخفيها عشان الشكل ميبوظش
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </AnimatePresence>

      {/* 👇👇 الشرط السحري: الأسهم تظهر فقط لو فيه أكثر من صورة 👇👇 */}
      {cleanImages.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronRight size={20} />
          </button>

          {/* نقاط (Dots) عشان يعرف هو في أنهي صورة */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {cleanImages.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ImageSlider