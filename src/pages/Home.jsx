import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import { Link } from 'react-router-dom'
import { getAllCategories, getProductsByCategory } from '../data/products'

const Home = () => {
  // Get some featured products from different categories for highlights
  const featuredProducts = [
    ...getProductsByCategory('woodslices').slice(0, 2),
    ...getProductsByCategory('frames').slice(0, 1),
    ...getProductsByCategory('medals').slice(0, 1)
  ]

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
              Discover our most loved pieces, each one telling a unique story
              of love, memory, and craftsmanship.
            </p>
          </motion.div>

          {/* Featured Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onOrderClick={() => {
                    // This would open the order modal, but for now just navigate to category
                    window.location.href = `/shop/${product.category}`
                  }}
                  isCategoryPage={true}
                />
              </motion.div>
            ))}
          </div>

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
                className="inline-flex items-center gap-3 bg-primary text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
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
    </div>
  )
}

export default Home
