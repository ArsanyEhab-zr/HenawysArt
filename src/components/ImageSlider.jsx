import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // دالة الصورة اللي بعدها
  const nextImage = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1 === images.length ? 0 : prev + 1))
  }

  // دالة الصورة اللي قبلها
  const prevImage = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 < 0 ? images.length - 1 : prev - 1))
  }

  // إعدادات الحركة (Animation)
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl group bg-gray-100">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
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
          alt="Product Image"
        />
      </AnimatePresence>

      {/* زرار اليمين */}
      <button
        onClick={(e) => {
           e.stopPropagation(); // عشان ميعملش click للكارت نفسه
           nextImage();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
      >
        <ChevronRight size={20} className="text-primary" />
      </button>

      {/* زرار الشمال */}
      <button
        onClick={(e) => {
           e.stopPropagation(); 
           prevImage();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
      >
        <ChevronLeft size={20} className="text-primary" />
      </button>

      {/* النقط اللي تحت (Dots) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default ImageSlider