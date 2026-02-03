import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Send, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { openWhatsAppChat } from '../utils/whatsapp'

const OrderModal = ({ isOpen, onClose, product }) => {
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')

  const [extras, setExtras] = useState({
    moreThanTwoPeople: false,
    carHangerType: 'single',
    isCoupleMedals: false,
    hasBackground: false,
    hasStand: false,
    hasPaintedBox: false
  })

  useEffect(() => {
    setExtras({
      moreThanTwoPeople: false,
      carHangerType: 'single',
      isCoupleMedals: false,
      hasBackground: false,
      hasStand: false,
      hasPaintedBox: false
    })
  }, [product, isOpen])

  const calculateTotal = () => {
    if (!product) return 0
    let total = Number(product.price)

    if (product.category === 'phonecases' && extras.moreThanTwoPeople) total += 50
    if (product.category === 'carhangers') {
      if (extras.carHangerType === 'textBack') total += 50
      if (extras.carHangerType === 'fullBack') total += 100
    }
    if ((product.category === 'medals' || product.category === 'acrylic') && extras.isCoupleMedals) {
      total = (total * 2) * 0.90
    }
    if (product.category === 'woodslices') {
      if (extras.hasBackground) total += 50
      if (extras.hasStand) total += 20
    }
    if (extras.hasPaintedBox) total += 50

    return Math.ceil(total)
  }

  const finalPrice = calculateTotal()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customerName.trim()) {
      alert('Please enter your name')
      return
    }

    let detailsString = `\n--- Order Details ---\n`
    if (extras.moreThanTwoPeople) detailsString += `• Extra Persons (>2): Yes (+50 EGP)\n`
    if (product.category === 'carhangers' && extras.carHangerType !== 'single') {
        const typeText = extras.carHangerType === 'textBack' ? 'Double Sided (Text)' : 'Double Sided (Characters)'
        detailsString += `• Type: ${typeText}\n`
    }
    if (extras.isCoupleMedals) detailsString += `• Couple Set (2 Pieces with 10% OFF)\n`
    if (extras.hasBackground) detailsString += `• Add Scenery Background: Yes (+50 EGP)\n`
    if (extras.hasStand) detailsString += `• Wooden Stand: Yes (+20 EGP)\n`
    if (extras.hasPaintedBox) detailsString += `• Custom Painted Box: Yes (+50 EGP)\n`

    detailsString += `\nFinal Calculated Price: ${finalPrice} EGP`
    const fullNotes = notes + detailsString

    openWhatsAppChat(product, customerName, fullNotes)
    onClose()
    setCustomerName('')
    setNotes('')
  }

  const updateExtra = (key, value) => {
    setExtras(prev => ({ ...prev, [key]: value }))
  }

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative">
                  <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
                    <X size={24} />
                  </button>
                  <h2 className="text-2xl font-script font-bold mb-1">Customize Order</h2>
                  <p className="text-white/90 text-sm mb-2">{product.title}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-accent">{finalPrice} EGP</span>
                    {finalPrice !== Number(product.price) && (
                        <span className="text-sm text-white/70 line-through mb-1">{product.price} EGP</span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Customization Options</h3>

                    {/* 1. Phone Cases */}
                    {product.category === 'phonecases' && (
                        <label className="flex items-center justify-between p-2 rounded-lg border border-transparent hover:border-gray-200 cursor-pointer transition-all">
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={extras.moreThanTwoPeople}
                                    onChange={(e) => updateExtra('moreThanTwoPeople', e.target.checked)}
                                />
                                <span className="text-gray-700">More than 2 people <span className="text-primary font-bold">(+50 EGP)</span></span>
                            </div>
                            {/* صورة توضيحية */}
                            <img src="/images/many-people.jpg" alt="example" className="w-12 h-12 rounded object-cover border border-gray-200" />
                        </label>
                    )}

                    {/* 2. Car Hangers */}
                    {product.category === 'carhangers' && (
                        <div className="space-y-2">
                            {/* Single Sided */}
                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="radio" name="hangerType"
                                        className="text-primary focus:ring-primary"
                                        checked={extras.carHangerType === 'single'}
                                        onChange={() => updateExtra('carHangerType', 'single')}
                                    />
                                    <span className="text-gray-700">Single Sided (Standard)</span>
                                </div>
                            </label>

                            {/* Text Back (+Image) */}
                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="radio" name="hangerType"
                                        className="text-primary focus:ring-primary"
                                        checked={extras.carHangerType === 'textBack'}
                                        onChange={() => updateExtra('carHangerType', 'textBack')}
                                    />
                                    <span className="text-gray-700">Back Side Text <span className="text-primary font-bold">(+50)</span></span>
                                </div>
                                {/* 👇 حط رابط صورة لظهر مكتوب عليه هنا */}
                                <img src="/images/text-back.jpg" alt="text example" className="w-12 h-12 rounded object-cover border border-gray-200" />
                            </label>

                            {/* Full Back (+Image) */}
                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="radio" name="hangerType"
                                        className="text-primary focus:ring-primary"
                                        checked={extras.carHangerType === 'fullBack'}
                                        onChange={() => updateExtra('carHangerType', 'fullBack')}
                                    />
                                    <span className="text-gray-700">Back Side Drawing <span className="text-primary font-bold">(+100)</span></span>
                                </div>
                                {/* 👇 حط رابط صورة لظهر مرسوم عليه هنا */}
                                <img src="/images/draw-back.jpg" alt="drawing example" className="w-12 h-12 rounded object-cover border border-gray-200" />
                            </label>
                        </div>
                    )}

                    {/* 3. Medals */}
                    {(product.category === 'medals' || product.category === 'acrylic') && (
                        <label className="flex items-center justify-between gap-3 cursor-pointer bg-accent/10 p-2 rounded-lg border border-accent/20">
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={extras.isCoupleMedals}
                                    onChange={(e) => updateExtra('isCoupleMedals', e.target.checked)}
                                />
                                <div className="flex flex-col">
                                    <span className="text-gray-800 font-medium">Buy Couple Set (2 Pieces)</span>
                                    <span className="text-xs text-green-600 font-bold">Get 10% Discount!</span>
                                </div>
                            </div>
                             {/* 👇 صورة لميداليتين كابلز */}
                            <img src="/images/couple-medals.jpg" alt="couple" className="w-12 h-12 rounded object-cover border border-gray-200" />
                        </label>
                    )}

                    {/* 4. Wood Slices */}
                    {product.category === 'woodslices' && (
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer p-1 hover:bg-white rounded">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={extras.hasBackground}
                                        onChange={(e) => updateExtra('hasBackground', e.target.checked)}
                                    />
                                    <span className="text-gray-700">Add Scenery Background <span className="text-primary font-bold">(+50)</span></span>
                                </div>
                                 {/* 👇 صورة لجزع بخلفية منظر طبيعي */}
                                <img src="/images/background-example.jpg" alt="bg" className="w-12 h-12 rounded object-cover border border-gray-200" />
                            </label>
                            
                            <label className="flex items-center justify-between cursor-pointer p-1 hover:bg-white rounded">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={extras.hasStand}
                                        onChange={(e) => updateExtra('hasStand', e.target.checked)}
                                    />
                                    <span className="text-gray-700">Add Wooden Stand <span className="text-primary font-bold">(+20)</span></span>
                                </div>
                                 {/* 👇 صورة للستاند الخشب */}
                                <img src="public\images\stand.jpg" alt="stand" className="w-12 h-12 rounded object-cover border border-gray-200" />
                            </label>
                        </div>
                    )}

                    {/* 5. Custom Box */}
                    <div className="pt-2 border-t border-gray-200 mt-2">
                        <label className="flex items-center justify-between cursor-pointer p-1 hover:bg-white rounded">
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={extras.hasPaintedBox}
                                    onChange={(e) => updateExtra('hasPaintedBox', e.target.checked)}
                                />
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Package size={18} />
                                    <span>Custom Painted Box <span className="text-primary font-bold">(+50)</span></span>
                                </div>
                            </div>
                            {/* 👇 صورة للبوكس المرسوم */}
                            <img src="/images/painted-box.jpg" alt="box" className="w-12 h-12 rounded object-cover border border-gray-200" />
                        </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Special Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                      placeholder="Describe your design..."
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                    <Upload className="text-yellow-600 mt-1" size={18} />
                    <p className="text-xs text-yellow-800">
                      You will attach your photo directly in WhatsApp after clicking send.
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-accent text-text font-semibold py-4 rounded-lg hover:bg-accent-dark shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Send Order via WhatsApp
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