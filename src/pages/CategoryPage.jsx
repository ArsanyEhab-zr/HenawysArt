import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal'
import { supabase } from '../supabaseClient'

const CategoryPage = () => {
  const { category } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : ''

  useEffect(() => {
    fetchCategoryProducts()

    const channel = supabase
      .channel('realtime-category-products')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          setProducts((currentProducts) =>
            currentProducts.map((product) =>
              product.id === payload.new.id ? payload.new : product
            )
          );
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [category])

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('price', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderClick = async (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)

    try {
      const sessionKey = `viewed_p_${product.id}`
      const hasViewed = sessionStorage.getItem(sessionKey)

      if (!hasViewed) {
        await supabase.rpc('increment_product_views', { p_id: product.id })
        const visitId = sessionStorage.getItem('current_visit_id')
        if (visitId) {
          await supabase.from('visit_activities').insert({
            visit_id: visitId,
            product_id: product.id
          })
        }
        sessionStorage.setItem(sessionKey, 'true')
      }
    } catch (err) {
      console.error("Tracking error:", err)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // 👇 تعديل شاشة التحميل للدارك مود
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0f172a] transition-colors duration-300">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <div className="text-xl text-primary font-script tracking-wider">Loading {categoryName}...</div>
      </div>
    )
  }

  // 👇 تعديل شاشة "لا توجد منتجات"
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0f172a] p-4 transition-colors duration-300">
        <Navbar />
        <div className="text-center mt-20">
          <h1 className="text-3xl font-script text-text dark:text-[#e2e8f0] mb-4">Category not found</h1>
          <p className="text-gray-500 dark:text-[#94a3b8] mb-8">
            We couldn't find any products in the "{categoryName}" category yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors border border-primary px-6 py-2 rounded-full hover:bg-primary/5 dark:hover:bg-primary/10"
          >
            <ArrowLeft size={20} />
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    // 👇 الخلفية الرئيسية
    <div className="min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      <Navbar />

      {/* Header Section */}
      <section className="pt-32 pb-12 bg-white dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link
              to="/shop"
              className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Shop
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-script text-text dark:text-[#e2e8f0] mb-6">
              {categoryName}
            </h1>
            <p className="text-lg text-gray-600 dark:text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
              Discover our collection of handcrafted {categoryName.toLowerCase()}.
              Each piece is made with love and attention to detail.
            </p>
            <div className="w-24 h-1 bg-accent mx-auto mt-8 rounded-full opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-20 bg-white dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onOrderClick={handleOrderClick}
                  isCategoryPage={true}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <OrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedProduct}
      />
    </div>
  )
}

export default CategoryPage