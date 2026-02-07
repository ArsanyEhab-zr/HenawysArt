import { motion } from 'framer-motion'
import { Palette, AlertCircle } from 'lucide-react' // ضفنا أيقونة Alert
import ImageSlider from './ImageSlider'
import { supabase } from '../supabaseClient' // 👈 استدعاء Supabase عشان نخصم العدد

const ProductCard = ({ product, onOrderClick }) => {
  // 1. تحديد حالة المنتج (هل هو متاح ولا خلص؟)
  const isSoldOut = product.stock <= 0

  // 2. دالة التعامل مع الطلب (تخصم من المخزون وتفتح واتساب)
  const handleOrder = async () => {
    if (isSoldOut) return; // لو خلصان ميعملش حاجة

    // أفتح الواتساب الأول عشان العميل ميحسش بتأخير
    onOrderClick(product);

    // بعدها أخصم 1 من المخزون في الداتا بيز
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: product.stock - 1 })
        .eq('id', product.id)
      
      if (error) console.error('Error updating stock:', error)
      
      // ملحوظة: عشان الرقم يتحدث قدامك فوراً لازم تعمل Refresh للصفحة
      // أو تستخدم State management، بس كدا الداتا بيز اتحدثت خلاص.
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={!isSoldOut ? { y: -5 } : {}} // نلغي الأنيميشن لو خلصان
      className={`bg-white rounded-2xl shadow-md overflow-hidden relative transition-shadow duration-300 ${
        isSoldOut ? 'opacity-90' : 'hover:shadow-xl'
      }`}
    >
      
      {/* Image Area */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden group">
        
        {/* 👇 3. طبقة التغميق والبادج لما يكون Sold Out */}
        {isSoldOut && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="bg-red-600 text-white px-8 py-2 rotate-[-15deg] font-bold text-xl shadow-lg border-2 border-white/20 tracking-wider">
              SOLD OUT
            </div>
          </div>
        )}

        {/* عرض الصور (مع إضافة تأثير الرمادي لو خلصان) */}
        <div className={isSoldOut ? "filter grayscale brightness-50 pointer-events-none" : ""}>
            {product.images && product.images.length > 0 ? (
              <ImageSlider images={product.images} />
            ) : (
              <>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}

                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <span className="text-gray-400 text-sm text-center px-4">
                    {product.title}<br/><span className="text-xs">Image coming soon</span>
                  </span>
                </div>
              </>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-script text-gray-800">{product.title}</h3>
            {/* عرض العدد المتبقي لو قرب يخلص (أقل من 3) */}
            {!isSoldOut && product.stock <= 3 && (
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    Only {product.stock} left!
                </span>
            )}
        </div>

        {product.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className={`text-xl font-semibold ${isSoldOut ? 'text-gray-400 line-through' : 'text-primary'}`}>
            {product.price} EGP
          </span>
        </div>

        <motion.button
          onClick={handleOrder}
          disabled={isSoldOut} // قفل الزرار
          whileHover={!isSoldOut ? { scale: 1.02 } : {}}
          whileTap={!isSoldOut ? { scale: 0.98 } : {}}
          className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 
            ${isSoldOut 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-accent text-gray-800 hover:bg-yellow-400'
            }`}
        >
          {isSoldOut ? (
            <>
                <AlertCircle size={18} /> Unavailable
            </>
          ) : (
            <>
                <Palette size={18} /> Order Custom Piece
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProductCard