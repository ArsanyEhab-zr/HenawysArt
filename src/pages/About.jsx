import { motion } from 'framer-motion'
import { Heart, TreePine, Sparkles, Palette } from 'lucide-react'
import Navbar from '../components/Navbar'

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Handmade",
      description: "Each piece is crafted with love and attention to detail"
    },
    {
      icon: TreePine,
      title: "Natural Wood",
      description: "We use only the finest natural wood slices for our art"
    },
    {
      icon: Sparkles,
      title: "Sentimental Value",
      description: "Transforming your precious memories into timeless art"
    }
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-script text-text mb-6">
              Behind the Art
            </h1>
            <p className="text-xl text-text-light max-w-3xl mx-auto leading-relaxed">
              Every stroke tells a story. Every piece carries a memory.
              Welcome to the world of faceless art, where emotions speak louder than faces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <Palette className="w-24 h-24 text-primary/40 mx-auto mb-4" />
                  <p className="text-text-light font-medium">Artist at Work</p>
                </div>
              </div>
            </motion.div>

            {/* Story Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-script text-text">
                Our Passion for Faceless Art
              </h2>
              <div className="space-y-4 text-text-light leading-relaxed">
                <p>
                  Henawy's Art was born from a simple belief: that the most powerful stories
                  are told through emotions, not faces. Our faceless art style captures the
                  essence of human connection, focusing on gestures, colors, and the subtle
                  language of the heart.
                </p>
                <p>
                  Each piece begins with a natural wood slice, carefully selected for its
                  unique grain and character. We paint not what we see, but what we feel –
                  the warmth of a hug, the comfort of home, the joy of shared moments.
                </p>
                <p>
                  From custom paintings to personalized medals and frames, every creation
                  is a testament to the beauty of sentimental art. We believe that true
                  artistry lies in preserving memories that matter most.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-script text-text mb-4">
              Our Values
            </h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              These principles guide everything we create and every relationship we build.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6"
                >
                  <value.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="text-2xl font-script text-text mb-4">
                  {value.title}
                </h3>
                <p className="text-text-light leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workspace Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Workspace Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative order-2 lg:order-1"
              >
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <TreePine className="w-20 h-20 text-primary/40 mx-auto mb-4" />
                    <p className="text-text-light font-medium">Creative Workspace</p>
                  </div>
                </div>
              </motion.div>

              {/* Workspace Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center lg:text-left order-1 lg:order-2"
              >
                <h2 className="text-3xl md:text-4xl font-script text-text mb-6">
                  Where Art Comes to Life
                </h2>
                <p className="text-lg text-text-light leading-relaxed mb-6">
                  Our studio is a sanctuary of creativity, where natural light dances
                  with wood grains and paints whisper stories yet to be told.
                  Every piece begins here, in this space dedicated to preserving memories.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles size={18} />
                    <span className="font-medium">Natural Light</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Heart size={18} />
                    <span className="font-medium">Love in Every Stroke</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About