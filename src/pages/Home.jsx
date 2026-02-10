import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, Sparkles, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Home = () => {
  const [topProducts, setTopProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([]) // 👈 حالة المنتجات الجديدة
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchAllData()

    // الاستماع اللحظي عشان لو المخزون اتغير والعميل فاتح الهوم
    const channel = supabase
      .channel('home-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        setTopProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
        setNewArrivals(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // 1. جلب الأكثر مبيعاً
      const { data: top } = await supabase
        .from('products')
        .select('*')
        .order('sold_count', { ascending: false })
        .limit(4)

      // 2. جلب الجديد (اللي أنت اخترته يدوياً)
      const { data: news } = await supabase
        .from('products')
        .select('*')
        .eq('is_new_arrival', true) // 👈 السر هنا
        .limit(4)

      setTopProducts(top || [])
      setNewArrivals(news || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* 🔥 Section: Top Sellers 🔥 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-[0.2em]">
              Community Favorites
            </span>
            <h2 className="text-4xl md:text-5xl font-script text-text mb-4">
              Top Sellers
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {!loading && topProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onOrderClick={() => handleOrderClick(product)}
              />
            ))}
          </div>


          {/* ✨ Section: New Arrivals (الجزء اللي بيشد الناس) ✨ */}

          <section className="py-20 bg-gradient-to-b from-white to-gray-50/50">

            <div className="max-w-7xl mx-auto px-4">

              <motion.div

                initial={{ opacity: 0, x: -20 }}

                whileInView={{ opacity: 1, x: 0 }}

                className="flex items-center gap-3 mb-8"

              >

                <div className="bg-accent/20 p-2 rounded-lg text-accent">

                  <Sparkles size={24} />

                </div>

                <div>

                  <h2 className="text-3xl md:text-4xl font-script text-text">New Arrivals</h2>

                  <p className="text-sm text-text-light uppercase tracking-widest font-bold">Latest creations from the studio</p>

                </div>

              </motion.div>



              {loading ? (

                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                  {newArrivals.map((product, index) => (

                    <motion.div

                      key={product.id}

                      initial={{ opacity: 0, scale: 0.9 }}

                      whileInView={{ opacity: 1, scale: 1 }}

                      transition={{ delay: index * 0.1 }}

                    >

                      {/* استخدمنا نفس كرت المنتج عشان التناسق */}

                      <ProductCard product={product} onOrderClick={() => handleOrderClick(product)} />

                    </motion.div>

                  ))}

                </div>

              )}

            </div>

          </section>

          {/* CTA Button */}
          <div className="text-center">
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:shadow-primary/20 flex items-center gap-3 mx-auto transition-all"
              >
                Explore Full Gallery
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  )
}

export default Home