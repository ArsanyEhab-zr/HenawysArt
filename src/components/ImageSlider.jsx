import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Layers } from 'lucide-react'

// إعدادات الانيميشن عشان تكون ناعمة زي تطبيقات الموبايل
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95 // تأثير زووم خفيف
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95
  })
}

// إعدادات السحب (Swipe)
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

const ImageSlider = ({ images }) => {
  // بنستخدم [page, direction] عشان الانيميشن يظبط اتجاهه صح
  const [[page, direction], setPage] = useState([0, 0]);

  // تنظيف الروابط
  const cleanImages = (images || []).map(img => img?.trim()).filter(Boolean);

  // حساب الاندكس الحالي بناءً على الصفحة (عشان يدعم اللف اللانهائي)
  const imageIndex = Math.abs(page % cleanImages.length);

  // لو مفيش صور
  if (!cleanImages.length) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400">
        <ImageIcon size={40} className="mb-2 opacity-50" />
        <span className="text-xs font-medium">No Image</span>
      </div>
    );
  }

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100 group select-none">

      {/* 👇👇 التعديل الجديد: عداد الصور (Badge) يظهر لو فيه أكتر من صورة 👇👇 */}
      {cleanImages.length > 1 && (
        <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/10">
          <Layers size={10} />
          <span>{imageIndex + 1} / {cleanImages.length}</span>
        </div>
      )}

      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={page} // المفتاح هنا هو الصفحة عشان الرياكت يعرف يغير الصورة
          src={cleanImages[imageIndex]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          // فيزياء الحركة (Spring) عشان تبقى ناعمة ومطاطية
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 }
          }}
          // 👇 خصائص السحب (Swipe Logic)
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1); // سحب لليسار -> التالي
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1); // سحب لليمين -> السابق
            }
          }}
          className="absolute top-0 left-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </AnimatePresence>

      {/* 👇 أزرار التحكم (تظهر فقط لو فيه أكثر من صورة) 👇 */}
      {cleanImages.length > 1 && (
        <>
          {/* زرار السابق */}
          <div
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => e.stopPropagation()} // منع انتشار الضغطة للكارت
          >
            <button
              onClick={() => paginate(-1)}
              className="bg-white/30 backdrop-blur-md hover:bg-white text-white hover:text-black p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 border border-white/20"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* زرار التالي */}
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => paginate(1)}
              className="bg-white/30 backdrop-blur-md hover:bg-white text-white hover:text-black p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 border border-white/20"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* نقاط (Dots) محسنة */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
            {cleanImages.map((_, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  // حسبة بسيطة للذهاب لصورة معينة
                  const direction = idx > imageIndex ? 1 : -1;
                  setPage([idx, direction]);
                }}
                className={`cursor-pointer transition-all duration-300 rounded-full shadow-sm
                  ${idx === imageIndex
                    ? 'bg-white w-4 h-1.5' // النقطة النشطة عريضة
                    : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/80'}` // النقطة العادية
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ImageSlider