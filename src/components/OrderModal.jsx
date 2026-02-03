import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Send, Loader2, ImagePlus } from 'lucide-react' // ضيفنا ايقونات جديدة
import { useState, useEffect } from 'react'
import { openWhatsAppChat } from '../utils/whatsapp'
import { supabase } from '../supabaseClient'

const OrderModal = ({ isOpen, onClose, product }) => {
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  
  // States للإضافات
  const [availableAddons, setAvailableAddons] = useState([])
  const [loadingAddons, setLoadingAddons] = useState(false)
  const [selections, setSelections] = useState({})

  // States للصورة المرفوعة 🆕
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isOpen && product) {
      fetchAddons()
      setSelections({})
      setSelectedFile(null) // تصفير الصورة
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

  const handleToggleAddon = (addon) => {
    setSelections(prev => {
      const newSelections = { ...prev }
      if (addon.ui_type === 'checkbox') {
        if (newSelections[addon.id]) delete newSelections[addon.id]
        else newSelections[addon.id] = addon
      } else if (addon.ui_type === 'radio') {
        if (newSelections[addon.id]) delete newSelections[addon.id]
        else newSelections[addon.id] = addon
      }
      return newSelections
    })
  }

  const calculateTotal = () => {
    if (!product) return 0
    let finalTotal = 0
    let basePrice = Number(product.price)
    
    const coupleAddon = Object.values(selections).find(a => a.operation_type === 'percent_double_discount')
    
    if (coupleAddon) {
      const doublePrice = basePrice * 2
      const discountValue = doublePrice * (Number(coupleAddon.value) / 100)
      finalTotal = doublePrice - discountValue
    } else {
      finalTotal = basePrice
    }

    Object.values(selections).forEach(addon => {
      if (addon.operation_type === 'percent_double_discount') return

      if (addon.operation_type === 'fixed') {
        finalTotal += Number(addon.value)
      } else if (addon.operation_type === 'percent_add') {
        const surcharge = basePrice * (Number(addon.value) / 100)
        finalTotal += surcharge
      }
    })

    return Math.ceil(finalTotal)
  }

  const finalPrice = calculateTotal()

  // 🆕 دالة رفع الصورة لـ Supabase
  const uploadImage = async (file) => {
    try {
        // 1. تغيير اسم الملف عشان ميتكررش (مثلا: timestamp-filename.jpg)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        // 2. الرفع
        const { error: uploadError } = await supabase.storage
            .from('client-uploads') // تأكد ان ده اسم الـ Bucket اللي عملته
            .upload(filePath, file)

        if (uploadError) throw uploadError

        // 3. هات الرابط
        const { data } = supabase.storage
            .from('client-uploads')
            .getPublicUrl(filePath)

        return data.publicUrl
    } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image. Please try again.')
        return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerName.trim()) { alert('Please enter name'); return }

    // تشغيل حالة التحميل لو فيه صورة
    if (selectedFile) setIsUploading(true)

    let uploadedImageUrl = ''
    
    // 🆕 لو العميل اختار صورة، ارفعها الأول
    if (selectedFile) {
        uploadedImageUrl = await uploadImage(selectedFile)
        if (!uploadedImageUrl) {
            setIsUploading(false)
            return // وقف العملية لو الرفع فشل
        }
    }

    // تجهيز الرسالة
    let detailsString = `\n--- Order Details ---\n`
    const selectedList = Object.values(selections)

    if (selectedList.length === 0) detailsString += `• Base Item: ${product.price} EGP\n`

    selectedList.forEach(addon => {
      let costText = ''
      if (addon.operation_type === 'fixed') costText = `(+${addon.value} EGP)`
      else if (addon.operation_type === 'percent_add') {
        const val = Math.ceil(Number(product.price) * (Number(addon.value) / 100))
        costText = `(${addon.value}% Surcharge: +${val} EGP)`
      } 
      else if (addon.operation_type === 'percent_double_discount') costText = `(2 Pieces @ ${addon.value}% OFF)`
      detailsString += `• ${addon.title}: Yes ${costText}\n`
    })

    // 🆕 إضافة رابط الصورة للرسالة
    if (uploadedImageUrl) {
        detailsString += `\n🖼️ Reference Image Link:\n${uploadedImageUrl}\n`
    }

    detailsString += `\n💰 Final Calculated Price: ${finalPrice} EGP`
    
    openWhatsAppChat(product, customerName, notes + detailsString)
    
    setIsUploading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative">
                <button onClick={onClose} className="absolute top-4 right-4"><X /></button>
                <h2 className="text-2xl font-script font-bold">Customize Order</h2>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-3xl font-bold text-accent">{finalPrice} EGP</span>
                    {finalPrice !== Number(product.price) && (
                         <span className="text-sm text-white/70 line-through mb-1">
                             {selections[Object.keys(selections).find(k => selections[k].operation_type === 'percent_double_discount')] 
                                ? Number(product.price) * 2 
                                : product.price} EGP
                         </span>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {/* Addons Section */}
               <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                 {loadingAddons ? <Loader2 className="animate-spin mx-auto"/> : availableAddons.map(addon => {
                   const isSelected = !!selections[addon.id]
                   let priceTag = ''
                   if(addon.operation_type === 'fixed') priceTag = `+${addon.value} EGP`
                   if(addon.operation_type === 'percent_add') priceTag = `+${addon.value}%`
                   if(addon.operation_type === 'percent_double_discount') priceTag = `${addon.value}% OFF`

                   return (
                     <label key={addon.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary bg-white shadow-sm' : 'border-transparent hover:bg-white'}`}>
                       <div className="flex items-center gap-3">
                         <input type={addon.ui_type} checked={isSelected} onChange={() => handleToggleAddon(addon)} className="text-primary focus:ring-primary w-5 h-5"/>
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

               {/* 🆕 Image Upload Input */}
               <div>
                 <label className="block text-sm font-medium text-text mb-2">Upload Reference Image (Optional)</label>
                 <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}>
                    <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id="image-upload"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {selectedFile ? (
                            <>
                                <ImagePlus className="text-primary" size={32} />
                                <span className="text-sm text-primary font-semibold">{selectedFile.name}</span>
                                <span className="text-xs text-gray-500">Click to change</span>
                            </>
                        ) : (
                            <>
                                <Upload className="text-gray-400" size={32} />
                                <span className="text-sm text-gray-600">Click to upload image</span>
                                <span className="text-xs text-gray-400">JPG, PNG supported</span>
                            </>
                        )}
                    </label>
                 </div>
               </div>

               <input placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-3 border rounded-lg" required />
               <textarea placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border rounded-lg" />
               
               <button 
                type="submit" 
                disabled={isUploading}
                className={`w-full bg-accent text-text font-bold py-3 rounded-lg flex justify-center items-center gap-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
               >
                 {isUploading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} /> Uploading Image...
                    </>
                 ) : (
                    <>
                        <Send size={18} /> Send to WhatsApp
                    </>
                 )}
               </button>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default OrderModal