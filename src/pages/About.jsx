import { motion } from 'framer-motion'
import { Heart, TreePine, Sparkles, Palette, Calendar, Users, ShoppingBag, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'

const About = () => {
  const stats = [
    { label: "Founded", value: "Dec 16, 2023", icon: Calendar },
    { label: "Orders Delivered", value: "+450", icon: ShoppingBag },
    { label: "Happy Clients", value: "+1000", icon: Users },
  ]

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

      {/* 1. Hero Section */}
      <section className="pt-32 pb-20 bg-background relative overflow-hidden">
        {/* خلفية زخرفية */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-script text-text mb-6">
              Behind the Art
            </h1>
            <p className="text-xl md:text-2xl text-text-light max-w-3xl mx-auto leading-relaxed font-light">
              From a small desk to over <span className="text-primary font-bold">450 homes</span>. 
              This is the story of Henawy's Art.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                   <stat.icon size={24} />
                </div>
                <div className="text-left">
                   <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                   <p className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Story & Logo Evolution (Rebranding) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Logo Evolution Visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative bg-white rounded-[3rem] p-8 shadow-xl border border-stone-100 overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
                 
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    {/* Old Logo Placeholder */}
                                    <div className="text-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                        {/* ضيفنا overflow-hidden عشان الصورة متخرجش بره الدايرة */}
                                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3 border-2 border-dashed border-gray-400 overflow-hidden relative">
                                            {/* 👇 كود الصورة الصح */}
                                            <img 
                                                src="/oldLogo.jpeg" 
                                                alt="Old Logo" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-400">Where we started</p>
                                    </div>

                    <ArrowRight className="text-primary hidden md:block" size={32} />
                    <div className="md:hidden rotate-90 text-primary"><ArrowRight size={32} /></div>

                    {/* New Logo Placeholder */}
                    <div className="text-center transform scale-110">
                       <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-primary/20">
                          <img src="/logo.png" alt="Henawy's Art New Logo" className="w-28 object-contain" />
                       </div>
                       <p className="text-sm text-primary font-bold">New Era (2026)</p>
                    </div>
                 </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
              <div className="absolute -z-10 bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Story Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-2">
                 Since 16/12/2023
              </div>
              <h2 className="text-4xl md:text-5xl font-script text-text mb-4">
                Growing with Art
              </h2>
              <div className="space-y-4 text-text-light leading-relaxed text-lg">
                <p>
                  It all started on <span className="font-bold text-gray-800">December 16, 2023</span>. 
                  Henawy's Art was born from a simple belief: that the most powerful stories 
                  are told through emotions, not faces.
                </p>
                <p>
                  We started with a humble logo and a big dream. As our art evolved, so did our identity. 
                  Our rebranding represents our growth from a small hobby into a professional studio 
                  trusted by hundreds.
                </p>
                <p>
                  Today, after delivering over <span className="font-bold text-primary">450 orders</span>, 
                  our mission remains the same: transforming natural wood slices into 
                  timeless memories that speak the language of the heart.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Values Section */}
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
                whileHover={{ y: -10 }}
                className="text-center p-8 rounded-3xl bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-stone-50 hover:border-primary/20 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-6 rotate-3 hover:rotate-6 transition-transform">
                  <value.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Workspace Section */}
      <section className="py-20 bg-[#fdfbf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             {/* Text */}
             <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <h2 className="text-3xl md:text-4xl font-script text-text mb-6">
                  Where Art Comes to Life
                </h2>
                <p className="text-lg text-text-light leading-relaxed mb-8">
                  Our studio is a sanctuary of creativity, where natural light dances
                  with wood grains and paints whisper stories yet to be told.
                  Every piece begins here, in this space dedicated to preserving memories.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-sm text-gray-700">
                    <Sparkles size={20} className="text-accent" />
                    <span className="font-medium">Creative Studio</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-sm text-gray-700">
                    <Heart size={20} className="text-primary" />
                    <span className="font-medium">Made with Love</span>
                  </div>
                </div>
              </motion.div>

{/* Workspace Visual */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: 0.2 }}
  className="relative"
>
  <div className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
      {/* 👇 التعديل هنا: ضيفنا slash والستايل عشان تملأ المكان */}
      <img 
        src="/Picsart_26-02-04_10-56-04-378.png" 
        alt="Our Workspace" 
        className="w-full h-full object-cover"
      />
  </div>
  {/* ديكور بسيط */}
  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary rounded-full opacity-10"></div>
</motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default About