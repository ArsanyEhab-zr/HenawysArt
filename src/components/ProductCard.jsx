import { motion } from 'framer-motion'
import { Palette, AlertCircle } from 'lucide-react'
import ImageSlider from './ImageSlider'
import { supabase } from '../supabaseClient'

const ProductCard = ({ product, onOrderClick }) => {

  // 🧹 دالة تنظيف الروابط
  const getImages = () => {
    if (!product.images) return [];

    let imageList = [];

    // 1. استخراج الروابط سواء كانت مصفوفة أو نص
    if (Array.isArray(product.images)) {
      imageList = product.images;
    } else if (typeof product.images === 'string') {
      try {
        let cleanStr = product.images.replace(/{/g, '[').replace(/}/g, ']');
        imageList = JSON.parse(cleanStr);
      } catch (e) {
        imageList = product.images.replace(/["'{}\[\]]/g, '').split(',');
      }
    }

    // 2. التنظيف العميق
    return imageList
      .map(url => url.trim())
      .filter(url => url.length > 10 && !url.includes('null') && url.startsWith('http'));
  };

  const displayImages = getImages();
  const isSoldOut = product.stock <= 0;

  // دالة التعامل مع الطلب
  const handleOrder = async () => {
    if (isSoldOut) return;
    onOrderClick(product);
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: product.stock - 1 })
        .eq('id', product.id)
      if (error) console.error('Error updating stock:', error)
    } catch (err) { console.error(err) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={!isSoldOut ? { y: -5 } : {}}
      className={`bg-white dark:bg-[#1e293b] rounded-2xl shadow-md overflow-hidden relative transition-all duration-300 ${isSoldOut ? 'opacity-90' : 'hover:shadow-xl'
        } border border-gray-100 dark:border-gray-800`}
    >
      {/* 🖼️ حاوية الصور الرئيسية */}
      <div className="aspect-square bg-gray-100 dark:bg-slate-800 relative overflow-hidden group">

        {isSoldOut && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="bg-red-600 text-white px-8 py-2 rotate-[-15deg] font-bold text-xl shadow-lg border-2 border-white/20 tracking-wider">
              SOLD OUT
            </div>
          </div>
        )}

        <div className={`w-full h-full ${isSoldOut ? "filter grayscale brightness-50 pointer-events-none" : ""}`}>
          {/* عرض السلايدر أو الصورة الواحدة */}
          {displayImages.length > 1 ? (
            <ImageSlider images={displayImages} />
          ) : displayImages.length === 1 ? (
            <img
              src={displayImages[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <>
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}

              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-gray-400 text-sm text-center px-4">
                  {product.title}<br /><span className="text-xs">Image coming soon</span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-script text-gray-800 dark:text-[#e2e8f0]">{product.title}</h3>
        </div>

        {!isSoldOut && (
          <div className={`flex items-center gap-2 mb-3 text-sm font-bold px-3 py-1.5 rounded-full w-fit border transition-colors duration-300
                ${product.stock <= 5
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30'
            }`}>
            <span className={`w-2 h-2 rounded-full ${product.stock <= 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
            {product.stock} {product.stock === 1 ? 'Piece' : 'Pieces'} Available
          </div>
        )}

        {product.description && (
          <p className="text-sm text-gray-500 dark:text-[#94a3b8] mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* 👇👇 التعديل النهائي (بدون تكرار وبدون قص للكلام) 👇👇 */}
        <div className="flex flex-wrap items-end justify-between gap-2 mb-4">

          {/* الجزء الخاص بالسعر */}
          <div className="flex items-end gap-2">
            {product.is_starting_price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 whitespace-nowrap">
                Starts from
              </span>
            )}

            <span className={`text-xl font-semibold whitespace-nowrap ${isSoldOut ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-primary dark:text-primary-light'}`}>
              {product.price} EGP
            </span>
          </div>

          {/* الجزء الخاص بالملاحظة (يظهر بالكامل وينزل سطر جديد) */}
          {product.is_starting_price && !isSoldOut && (
            <span className="text-[11px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg text-right leading-tight whitespace-normal max-w-full">
              Depends on {product.price_note || 'Details'}
            </span>
          )}

        </div>
        {/* 👆👆 نهاية التعديل 👆👆 */}

        <motion.button
          onClick={handleOrder}
          disabled={isSoldOut}
          whileHover={!isSoldOut ? { scale: 1.02 } : {}}
          whileTap={!isSoldOut ? { scale: 0.98 } : {}}
          className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 
            ${isSoldOut
              ? 'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-accent text-gray-800 hover:bg-yellow-400'
            }`}
        >
          {isSoldOut ? (<><AlertCircle size={18} /> Unavailable</>) : (<><Palette size={18} /> Order Custom Piece</>)}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProductCard