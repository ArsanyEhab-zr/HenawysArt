import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal'
import { getProductsByCategory, getCategoryDisplayName } from '../data/products'

const CategoryPage = () => {
  const { category } = useParams()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categoryProducts = getProductsByCategory(category)
  const categoryName = getCategoryDisplayName(category)

  if (!categoryProducts || categoryProducts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-script text-text mb-4">Category not found</h1>
          <Link to="/" className="text-primary hover:text-primary-dark">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  const handleOrderClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header Section */}
      <section className="pt-24 pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link
              to="/"
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
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

      {/* Products Grid */}
      <section className="pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryProducts.map((product, index) => (
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

      {/* Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedProduct}
      />
    </div>
  )
}

export default CategoryPage