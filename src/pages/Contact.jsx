import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // For now, just show an alert - in a real app this would send to a backend
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', message: '' })
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: "+20 128 014 0268",
      action: "tel:+201280140268"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "Direct Message",
      action: "https://wa.me/201280140268"
    },
    {
      icon: Mail,
      title: "Email",
      value: "hello@henawysart.com",
      action: "mailto:hello@henawysart.com"
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Egypt",
      action: null
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
              Get in Touch
            </h1>
            <p className="text-xl text-text-light max-w-3xl mx-auto leading-relaxed">
              Ready to create something special? We'd love to hear from you.
              Let's bring your memories to life through art.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-script text-text mb-6">
                  Let's Create Together
                </h2>
                <p className="text-text-light leading-relaxed mb-8">
                  Whether you have a specific vision or need guidance in choosing the perfect piece,
                  we're here to help. Reach out to us through any of the channels below.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text">{info.title}</h3>
                      {info.action ? (
                        <a
                          href={info.action}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <span className="text-text-light">{info.value}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-script text-text mb-6">
                Send us a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us about your project or ask any questions..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary text-white font-semibold py-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send size={18} />
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-script text-white mb-6">
              Ready to Start Your Custom Piece?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss your vision and create something truly special together.
            </p>
            <motion.a
              href="https://wa.me/201280140268"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-accent text-text font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <MessageCircle size={20} />
              Start on WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Contact