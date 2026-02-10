import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
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

    // 👇👇👇 كود الاستماع اللحظي (Realtime) 👇👇👇
    const channel = supabase
      .channel('realtime-category-products')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          // لما يحصل أي تعديل في المخزون، نحدث المنتج ده فوراً في الشاشة
          setProducts((currentProducts) =>
            currentProducts.map((product) =>
              product.id === payload.new.id ? payload.new : product
            )
          )
        }
      )
      .subscribe()

    // تنظيف الاشتراك لما تخرج من الصفحة
    return () => {
      supabase.removeChannel(channel)
    }
    // 👆👆👆 نهاية الكود الجديد 👆👆👆

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

  const handleOrderClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-primary font-script">Loading {categoryName}...</div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Navbar />
        <div className="text-center mt-20">
          <h1 className="text-3xl font-script text-text mb-4">Category not found</h1>
          <p className="text-text-light mb-8">
            We couldn't find any products in the "{categoryName}" category yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors border border-primary px-6 py-2 rounded-full hover:bg-primary/5"
          >
            <ArrowLeft size={20} />
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link
              to="/shop"
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Shop
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-script text-text mb-4">
              {categoryName}
            </h1>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Discover our collection of handcrafted {categoryName.toLowerCase()}.
              Each piece is made with love and attention to detail.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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