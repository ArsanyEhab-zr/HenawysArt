import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getAllCategories, getCategoryDisplayName } from '../data/products'

const Shop = () => {
  const categoryIds = getAllCategories()

  const categories = categoryIds.map(categoryId => ({
    id: categoryId,
    category: categoryId,
    name: getCategoryDisplayName(categoryId),
    description: `Handcrafted ${getCategoryDisplayName(categoryId).toLowerCase()} made with natural materials.`,
    price: `Starting at ${categoryId === 'woodslices' ? '260' : categoryId === 'frames' ? '200' : categoryId === 'medals' ? '120' : '250'} EGP`
  }))

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
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-script text-text mb-4">
              Our Collection
            </h1>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Discover our handcrafted art pieces, each created with love and natural materials.
              Transform your precious memories into timeless works arsany of art.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link to={`/shop/${category.category}`}>
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-8 h-96 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {/* Category Image Placeholder */}
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-8xl font-script text-primary/20">
                          {category.name.charAt(0)}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="mb-4"
                      >
                        <h3 className="text-3xl md:text-4xl font-script text-text mb-2">
                          {category.name}
                        </h3>
                        <p className="text-text-light text-lg leading-relaxed">
                          {category.description}
                        </p>
                      </motion.div>
                    </div>

                    {/* CTA */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold text-lg">
                          {category.price}
                        </span>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-primary group-hover:text-primary-dark transition-colors"
                        >
                          <span className="font-medium">Explore</span>
                          <ArrowRight size={20} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Shop