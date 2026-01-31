import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Send } from 'lucide-react'
import { useState } from 'react'
import { openWhatsAppChat } from '../utils/whatsapp'

const OrderModal = ({ isOpen, onClose, product }) => {
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customerName.trim()) {
      alert('Please enter your name')
      return
    }

    openWhatsAppChat(product, customerName, notes)
    onClose()
    // Reset form
    setCustomerName('')
    setNotes('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <h2 className="text-2xl font-script font-bold mb-2">Order Custom Piece</h2>
                <p className="text-white/90 text-sm">{product.name}</p>
                <p className="text-accent font-semibold text-lg">{product.price} EGP</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Customer Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Special Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-text mb-2">
                    Special Notes/Instructions
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Any special instructions or notes for your custom piece..."
                  />
                </div>

                {/* Photo Upload Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Upload className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        You will be redirected to WhatsApp. Please attach your photo there directly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-accent text-text font-semibold py-4 rounded-lg hover:bg-accent-dark transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send size={18} />
                  Send to WhatsApp
                </motion.button>
              </form>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default OrderModal