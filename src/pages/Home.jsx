import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal' // 👈 استيراد المودال
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react' // 👈 هوكات رياكت
import { supabase } from '../supabaseClient' // 👈 استيراد سوبا بيز

const Home = () => {
  // 1. States لتخزين المنتجات والتحميل والمودال
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 2. جلب المنتجات الأكثر مبيعاً عند فتح الصفحة
  useEffect(() => {
    fetchTopSellers()
  }, [])

  const fetchTopSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sold_count', { ascending: false }) // ترتيب تنازلي حسب عدد مرات البيع
        .limit(4) // هات أول 4 فقط

      if (error) throw error
      setTopProducts(data || [])
    } catch (error) {
      console.error('Error fetching top sellers:', error)
    } finally {
      setLoading(false)
    }
  }

  // دالة فتح المودال عند الضغط على منتج
  const handleOrderClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />

      {/* Highlights Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-script text-text mb-4">
              Top Sellers
            </h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Discover our most loved pieces, chosen by our customers for their unique stories and craftsmanship.
            </p>
          </motion.div>

          {/* Featured Products Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard
                      product={product}
                      onOrderClick={() => handleOrderClick(product)} // 👈 فتح المودال بدل اللينك
                      isCategoryPage={true}
                    />
                  </motion.div>
                ))
              ) : (
                <p className="text-center col-span-full text-gray-500">No top sellers yet.</p>
              )}
            </div>
          )}

          {/* CTA to Shop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link to="/shop">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-primary text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                Explore Full Collection
                <ArrowRight size={20} />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-script text-text mb-6">
              About Henawy's Art
            </h2>
            <p className="text-lg text-text-light leading-relaxed">
              We specialize in creating beautiful, sentimental artwork on natural
              wood slices using a unique faceless art style. Each piece is
              handcrafted with care, transforming your precious memories into
              timeless art. From custom paintings to medals and frames, we bring
              your stories to life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Order Modal Component */}
      <OrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  )
}

export default Home