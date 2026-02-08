import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { supabase } from '../supabaseClient'

const Shop = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)

      // 1. هنجيب الأقسام من الجدول الجديد مباشرة (أسرع وأنظف)
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')

      if (error) throw error

      // 2. (اختياري) ممكن نجيب أقل سعر لكل قسم عشان نعرض "Starts from"
      // بس عشان التسهيل، ممكن نكتب سعر تقريبي في الجدول نفسه أو نسيبها دلوقتي

      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching categories:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-script text-gray-900 mb-6 tracking-wide">
              Art Collections
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
              Explore our curated galleries. Every piece tells a story.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-xl text-gray-400 py-10">
              No collections found. Please add categories to your database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  {/* الرابط بيستخدم الـ slug اللي إنت حطيته في الداتا بيز */}
                  <Link to={`/shop/${category.slug}`}>

                    <div className="relative h-[450px] w-full overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500">

                      {/* صورة الخلفية (اللي إنت رفعتها مخصوص) */}
                      <div className="absolute inset-0 w-full h-full">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      {/* الظل */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300" />

                      {/* المحتوى */}
                      <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col justify-end h-full">

                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-4xl font-script text-white drop-shadow-md mb-2">
                            {category.name}
                          </h3>

                          <p className="text-gray-200 text-sm font-light tracking-wider uppercase mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                            {category.description}
                          </p>

                          <div className="flex items-center justify-between border-t border-white/20 pt-4">
                            <span className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
                              Explore Collection <ArrowRight size={18} />
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Shop