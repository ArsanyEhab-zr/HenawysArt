import { motion } from 'framer-motion'
import { Palette, AlertCircle } from 'lucide-react'
import ImageSlider from './ImageSlider'
import { supabase } from '../supabaseClient'

const ProductCard = ({ product, onOrderClick }) => {
  
  // 🧹 دالة تنظيف الروابط (الإصدار النهائي المضمون)
  const getImages = () => {
    if (!product.images) return [];
    
    let imageList = [];

    // 1. استخراج الروابط سواء كانت مصفوفة أو نص
    if (Array.isArray(product.images)) {
      imageList = product.images;
    } else if (typeof product.images === 'string') {
      try {
        // تنظيف أقواس Postgres والـ JSON
        let cleanStr = product.images.replace(/{/g, '[').replace(/}/g, ']');
        imageList = JSON.parse(cleanStr);
      } catch (e) {
        // لو فشل التحويل، افصل بالفاصلة
        imageList = product.images.replace(/["'{}\[\]]/g, '').split(',');
      }
    }

    // 2. التنظيف العميق 🧼
    return imageList
      .map(url => url.trim()) // شيل المسافات
      .filter(url => url.length > 10 && !url.includes('null') && url.startsWith('http')); // تأكد إنه رابط حقيقي
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
      className={`bg-white rounded-2xl shadow-md overflow-hidden relative transition-shadow duration-300 ${
        isSoldOut ? 'opacity-90' : 'hover:shadow-xl'
      }`}
    >
      {/* 🖼️ حاوية الصور الرئيسية */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden group">
        
        {isSoldOut && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="bg-red-600 text-white px-8 py-2 rotate-[-15deg] font-bold text-xl shadow-lg border-2 border-white/20 tracking-wider">
              SOLD OUT
            </div>
          </div>
        )}

        {/* ضفت w-full h-full عشان الـ div ياخد مساحة الكونتينر وميخليش الصور تختفي */}
        <div className={`w-full h-full ${isSoldOut ? "filter grayscale brightness-50 pointer-events-none" : ""}`}>
            {displayImages.length > 0 ? (
              <ImageSlider images={displayImages} />
            ) : (
              /* Fallback: لو مفيش صور في المصفوفة، اعرض الصورة الفردية */
              <>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
                
                {/* خلفية احتياطية لو كل الصور فشلت */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <span className="text-gray-400 text-sm text-center px-4">
                    {product.title}<br/><span className="text-xs">Image coming soon</span>
                  </span>
                </div>
              </>
            )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-script text-gray-800">{product.title}</h3>
        </div>

        {!isSoldOut && (
            <div className={`flex items-center gap-2 mb-3 text-sm font-bold px-3 py-1.5 rounded-full w-fit border transition-colors duration-300
                ${product.stock <= 5 
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-green-50 text-green-700 border-green-100'
                }`}>
                <span className={`w-2 h-2 rounded-full ${product.stock <= 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                {product.stock} {product.stock === 1 ? 'Piece' : 'Pieces'} Available
            </div>
        )}

        {product.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* 👇👇 التعديل الجديد: السعر بيبدأ من 👇👇 */}
        <div className="flex items-end gap-2 mb-4">
            {/* لو الخاصية متفعلة في الداتا بيز، اكتب Starts from */}
            {product.is_starting_price && (
                <span className="text-sm text-gray-500 font-medium mb-1">
                Starts from
                </span>
            )}

            <span className={`text-xl font-semibold ${isSoldOut ? 'text-gray-400 line-through' : 'text-primary'}`}>
                {product.price} EGP
            </span>

            {/* بادج صغير يوضح إن السعر حسب المقاس */}
            {product.is_starting_price && !isSoldOut && (
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-auto">
                Depends on size
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
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
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