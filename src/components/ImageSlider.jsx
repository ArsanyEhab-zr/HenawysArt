import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

// نفس الـ variants بتاعتك
const variants = {
  enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
}

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // 👇👇👇 السطرين السحريين للكشف عن المشكلة 👇👇👇
  // أول ما السلايدر يشتغل، هيطبعلك في الكونسول هو استلم صور ولا لأ
  useEffect(() => {
    console.log("📢 Slider Loaded!");
    console.log("📸 Images received:", images);
  }, [images]);

  // تنظيف سريع (عشان لو فيه مسافات)
  const cleanImages = (images || []).map(img => img?.trim()).filter(Boolean);

  // لو مفيش صور، هنعرض مربع أحمر عشان نعرف إن السلايدر اشتغل بس مفيش داتا
  if (!cleanImages.length) {
    return (
        <div className="w-full h-full bg-red-100 flex items-center justify-center border-2 border-red-500">
            <p className="text-red-500 font-bold">Slider Connected but No Images!</p>
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
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
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
          // لو الصورة بايظة، هنخلي لونها أصفر
          onError={(e) => {
            console.log("❌ Failed to load:", cleanImages[currentIndex]);
            e.target.style.display = 'none';
            e.target.parentElement.style.backgroundColor = 'yellow';
          }}
        />
      </AnimatePresence>
      
      {/* الأسهم عشان التحكم */}
      <button onClick={prevImage} className="absolute left-2 top-1/2 z-10 bg-white/50 p-2 rounded-full"><ChevronLeft/></button>
      <button onClick={nextImage} className="absolute right-2 top-1/2 z-10 bg-white/50 p-2 rounded-full"><ChevronRight/></button>
    </div>
  )
}

export default ImageSlider