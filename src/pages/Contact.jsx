import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, MessageCircle, Send, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const scriptUrl = "https://script.google.com/macros/s/AKfycbwlXLx7LcNjp2F850skBK55Fn52hu3EJHNd-8q3-woeR6M9GVIK16-lff8Ba_EFC3Oy/exec"

    const formDatab = new FormData()
    formDatab.append('Date', new Date().toLocaleString())
    formDatab.append('Name', formData.name)
    formDatab.append('Email', formData.email)
    formDatab.append('Message', formData.message)

    fetch(scriptUrl, {
      method: 'POST',
      body: formDatab,
      mode: 'no-cors'
    })
      .then(() => {
        alert('تم الإرسال بنجاح! شكراً لرأيك ❤️')
        setFormData({ name: '', email: '', message: '' })
        setIsSubmitting(false)
      })
      .catch(error => {
        console.error('Error!', error.message)
        alert('تأكد من الرابط الجديد وصلاحيات الـ Anyone')
        setIsSubmitting(false)
      })
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
    // 👇 خلفية الصفحة كحلي في الدارك
    <div className="min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-background dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-script text-text dark:text-[#e2e8f0] mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-text-light dark:text-[#94a3b8] max-w-3xl mx-auto leading-relaxed">
              We value your feedback! Help us improve Henawy's Art.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50 dark:bg-[#0f172a]">
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
                <h2 className="text-3xl md:text-4xl font-script text-text dark:text-[#e2e8f0] mb-6">
                  Let's Create Together
                </h2>
                <p className="text-text-light dark:text-[#94a3b8] leading-relaxed mb-8">
                  Whether you have a specific vision, a question, or a suggestion to improve our website,
                  we're here to listen.
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
                    // 👇 الكروت في الدارك مود بقيت كحلي (#1e293b)
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e293b] shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text dark:text-[#e2e8f0]">{info.title}</h3>
                      {info.action ? (
                        <a
                          href={info.action}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <span className="text-text-light dark:text-[#94a3b8]">{info.value}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact / Feedback Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              // 👇 الفورم نفسها بقيت كحلي في الدارك
              className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg p-8 border border-primary/10 dark:border-[#334155]"
            >
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="text-accent w-8 h-8" />
                <h3 className="text-2xl font-script text-text dark:text-[#e2e8f0]">
                  Help Us Improve
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#94a3b8] mb-6">
                Have a suggestion for the website? Found a bug? Or just want to say hi? Write to us below!
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text dark:text-[#e2e8f0] mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    // 👇 المدخلات لونها أغمق سنة من الفورم في الدارك
                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-white dark:bg-[#0f172a] dark:text-white"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text dark:text-[#e2e8f0] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-white dark:bg-[#0f172a] dark:text-white"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text dark:text-[#e2e8f0] mb-2">
                    Your Feedback / Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none bg-white dark:bg-[#0f172a] dark:text-white"
                    placeholder="Tell us what you think or how we can improve..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-white font-semibold py-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={18} /> Send Feedback
                    </>
                  )}
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
              Let's discuss your vision directly on WhatsApp.
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