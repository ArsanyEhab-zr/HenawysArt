import { motion } from 'framer-motion'
import { Palette } from 'lucide-react'
import ImageSlider from './ImageSlider' // 👈 1. استدعاء السلايدر (تأكد من المسار)

const ProductCard = ({ product, onOrderClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      {/* Image Area */}
      {/* ضفنا group عشان لما نقف على الكارت أسهم السلايدر تظهر */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden group">
        
        {/* 👇 2. شرط العرض: هل فيه صور كتير؟ اعرض السلايدر */}
        {product.images && product.images.length > 0 ? (
          <ImageSlider images={product.images} />
        ) : (
          /* 👇 3. لو مفيش صور كتير، شغل النظام القديم (صورة واحدة أو خلفية) */
          <>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}

            {/* الخلفية الاحتياطية (بتظهر لو مفيش صورة أو الصورة باظت) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="text-gray-400 text-sm text-center px-4">
                {product.title}<br/>
                <span className="text-xs">Image coming soon</span>
              </span>
            </div>
          </>
        )}
        
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-script text-gray-800 mb-2">{product.title}</h3>

        {product.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-semibold text-primary">
            {product.price} EGP
          </span>
        </div>

        <motion.button
          onClick={() => onOrderClick(product)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-accent text-gray-800 font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Palette size={18} />
          Order Custom Piece
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProductCard