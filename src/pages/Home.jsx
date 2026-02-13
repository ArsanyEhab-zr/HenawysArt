import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, Sparkles, Star, Zap, Truck, Palette, ShieldCheck, Gift } from 'lucide-react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Home = () => {
  const [topProducts, setTopProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchAllData()

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

      // 2. جلب الجديد
      const { data: news } = await supabase
        .from('products')
        .select('*')
        .eq('is_new_arrival', true)
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

  // مصفوفة المميزات
  const features = [
    {
      icon: <Palette size={28} />,
      title: "Handmade with Soul",
      desc: "100% Hand-painted on natural wood"
    },
    {
      icon: <Truck size={28} />,
      title: "Safe Shipping",
      desc: "Fast delivery to all governorates"
    },
    {
      icon: <Gift size={28} />,
      title: "Gift Ready",
      desc: "Premium packaging for your loved ones"
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Quality Guarantee",
      desc: "Durable varnish & vibrant colors"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* ✨ Features Strip Section (تعديل: رفعناه لفوق بتأثير زجاجي) ✨ */}
      <section className="relative z-20 -mt-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 dark:bg-[#1e293b]/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 group cursor-default"
              >
                <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary transition-colors notranslate">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔥 Section: Top Sellers 🔥 */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/5 dark:bg-primary/20 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-[0.2em]">
              Community Favorites
            </span>
            <h2 className="text-4xl md:text-5xl font-script text-gray-900 dark:text-white mb-4">
              Top Sellers
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {!loading && topProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOrderClick={() => handleOrderClick(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ✨ Section: New Arrivals (التصميم المضيء) ✨ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50 dark:bg-[#020617] transition-colors duration-300"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 dark:bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent p-2 rounded-lg text-white shadow-lg shadow-accent/30 rotate-3">
                  <Sparkles size={24} fill="currentColor" />
                </div>
                <h2 className="text-4xl md:text-5xl font-script text-gray-900 dark:text-white">
                  Fresh Drops
                </h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide pl-2 uppercase text-sm">
                Just landed in the studio
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Link to="/shop" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all duration-300 group">
                View All <ArrowRight size={20} className="group-hover:text-accent" />
              </Link>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -top-3 -right-2 z-20 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg rotate-12 group-hover:rotate-0 transition-all duration-300">
                    NEW
                  </div>
                  <ProductCard product={product} onOrderClick={() => handleOrderClick(product)} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center gap-2 text-primary font-bold">
              View All Collection <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Button Section */}
      <section className="py-20 bg-white dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/shop">
              <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-12 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-primary/50 flex items-center gap-4 mx-auto transition-all duration-300 group">
                Explore Full Gallery
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
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