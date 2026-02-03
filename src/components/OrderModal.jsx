import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Send, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { openWhatsAppChat } from '../utils/whatsapp'
import { supabase } from '../supabaseClient'

const OrderModal = ({ isOpen, onClose, product }) => {
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [availableAddons, setAvailableAddons] = useState([])
  const [loadingAddons, setLoadingAddons] = useState(false)
  const [selections, setSelections] = useState({})

  // Fetch Logic
  useEffect(() => {
    if (isOpen && product) {
      fetchAddons()
      setSelections({})
    }
  }, [product, isOpen])

  const fetchAddons = async () => {
    setLoadingAddons(true)
    try {
      const { data, error } = await supabase
        .from('product_addons')
        .select('*')
        .or(`category_target.eq.${product.category},category_target.eq.all`)
        
      if (error) throw error
      setAvailableAddons(data || [])
    } catch (error) {
      console.error('Error fetching addons:', error)
    } finally {
      setLoadingAddons(false)
    }
  }

  // Handle Select Logic
  const handleToggleAddon = (addon) => {
    setSelections(prev => {
      const newSelections = { ...prev }
      
      if (addon.ui_type === 'checkbox') {
        if (newSelections[addon.id]) delete newSelections[addon.id]
        else newSelections[addon.id] = addon
      } else if (addon.ui_type === 'radio') {
        // Remove others in same group if needed (logic simplified here)
        // For simple setup, we just toggle
        if (newSelections[addon.id]) delete newSelections[addon.id]
        else newSelections[addon.id] = addon
      }
      return newSelections
    })
  }

  // 🔥 دالة الحساب السحرية الجديدة 🔥
  const calculateTotal = () => {
    if (!product) return 0
    let finalTotal = 0
    let basePrice = Number(product.price)
    
    // 1. شوف هل مختارين "Couple Discount"؟ لأن ده بيغير الحسبة الأساسية
    const coupleAddon = Object.values(selections).find(a => a.operation_type === 'percent_double_discount')
    
    if (coupleAddon) {
      // السعر = (سعر القطعة * 2) - نسبة الخصم
      const doublePrice = basePrice * 2
      const discountValue = doublePrice * (Number(coupleAddon.value) / 100)
      finalTotal = doublePrice - discountValue
    } else {
      // السعر العادي
      finalTotal = basePrice
    }

    // 2. حساب باقي الإضافات (زي البوكس والستاند)
    Object.values(selections).forEach(addon => {
      // نتجاهل الكابلز هنا لأننا حسبناه فوق خلاص
      if (addon.operation_type === 'percent_double_discount') return

      if (addon.operation_type === 'fixed') {
        // إضافة رقم ثابت (زي الستاند +20)
        finalTotal += Number(addon.value)
      } 
      else if (addon.operation_type === 'percent_add') {
        // إضافة نسبة من "سعر القطعة الواحدة" (زي البوكس +10%)
        const surcharge = basePrice * (Number(addon.value) / 100)
        finalTotal += surcharge
      }
    })

    return Math.ceil(finalTotal)
  }

  const finalPrice = calculateTotal()

  // 📝 تجهيز رسالة الواتساب بالتفاصيل المادية
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customerName.trim()) { alert('Please enter name'); return }

    let detailsString = `\n--- Order Details ---\n`
    const selectedList = Object.values(selections)

    if (selectedList.length === 0) detailsString += `• Base Item: ${product.price} EGP\n`

    selectedList.forEach(addon => {
      let costText = ''
      
      if (addon.operation_type === 'fixed') {
        costText = `(+${addon.value} EGP)`
      } 
      else if (addon.operation_type === 'percent_add') {
        // نحسبها عشان نعرضها لليوزر كرقم مش نسبة
        const val = Math.ceil(Number(product.price) * (Number(addon.value) / 100))
        costText = `(${addon.value}% Surcharge: +${val} EGP)`
      } 
      else if (addon.operation_type === 'percent_double_discount') {
        costText = `(2 Pieces @ ${addon.value}% OFF)`
      }

      detailsString += `• ${addon.title}: Yes ${costText}\n`
    })

    detailsString += `\n💰 Final Calculated Price: ${finalPrice} EGP`
    openWhatsAppChat(product, customerName, notes + detailsString)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative">
                <button onClick={onClose} className="absolute top-4 right-4"><X /></button>
                <h2 className="text-2xl font-script font-bold">Customize Order</h2>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-3xl font-bold text-accent">{finalPrice} EGP</span>
                    {/* لو السعر اتغير، اشطب القديم */}
                    {finalPrice !== Number(product.price) && (
                         <span className="text-sm text-white/70 line-through mb-1">
                             {/* لو مختار كابلز، اشطب سعر القطعتين الاصلي، لو لا اشطب سعر القطعة */}
                             {selections[Object.keys(selections).find(k => selections[k].operation_type === 'percent_double_discount')] 
                                ? Number(product.price) * 2 
                                : product.price} EGP
                         </span>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {/* Addons List */}
               <div className="bg-gray-50 p-4 rounded-lg space-y-2 max-h-60 overflow-y-auto">
                 {loadingAddons ? <Loader2 className="animate-spin mx-auto"/> : availableAddons.map(addon => {
                   const isSelected = !!selections[addon.id]
                   
                   // تجهيز النص اللي هيظهر جنب السعر في الـ UI
                   let priceTag = ''
                   if(addon.operation_type === 'fixed') priceTag = `+${addon.value} EGP`
                   if(addon.operation_type === 'percent_add') priceTag = `+${addon.value}%`
                   if(addon.operation_type === 'percent_double_discount') priceTag = `${addon.value}% OFF`

                   return (
                     <label key={addon.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary bg-white shadow-sm' : 'border-transparent hover:bg-white'}`}>
                       <div className="flex items-center gap-3">
                         <input 
                           type={addon.ui_type} 
                           checked={isSelected} 
                           onChange={() => handleToggleAddon(addon)} 
                           className="text-primary focus:ring-primary w-5 h-5"
                         />
                         <div>
                            <p className="font-medium text-gray-800">{addon.title}</p>
                            <p className="text-xs text-primary font-bold">{priceTag}</p>
                         </div>
                       </div>
                       {addon.image_url && <img src={addon.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
                     </label>
                   )
                 })}
               </div>

               <input placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-3 border rounded-lg" required />
               <textarea placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border rounded-lg" />
               
               <button type="submit" className="w-full bg-accent text-text font-bold py-3 rounded-lg flex justify-center items-center gap-2">
                 <Send size={18} /> Send to WhatsApp
               </button>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default OrderModal