import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Palette } from 'lucide-react'
import { Link } from 'react-router-dom'

const ProductCard = ({ product, onOrderClick, isCategoryPage = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-background rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      {/* Image Area */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        
        {/* 1. التعديل هنا: استخدام image_url بدلاً من image */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            // 2. ضفنا z-10 و relative عشان الصورة تظهر فوق الخلفية
            className="w-full h-full object-cover relative z-10" 
            onError={(e) => {
              // لو الصورة فيها مشكلة، نخفيها عشان الخلفية تظهر
              e.target.style.display = 'none';
            }}
          />
        ) : null}

        {/* 3. الخلفية (Fallback): ضفنا absolute inset-0 عشان تكون تحت الصورة بالظبط */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
          <span className="text-text-light text-sm text-center px-4">
            {product.title}<br/>
            <span className="text-xs">Image coming soon</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-script text-text mb-2">{product.title}</h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-text-light mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-semibold text-primary">
            {product.price} EGP
          </span>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={() => onOrderClick(product)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-accent text-text font-semibold py-3 rounded-lg hover:bg-accent-dark transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Palette size={18} />
          Order Custom Piece
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProductCard