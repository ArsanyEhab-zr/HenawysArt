import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Send, Loader2, ImagePlus, MapPin, Palette, Type, AlertCircle, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { openWhatsAppChat } from '../utils/whatsapp'
import { supabase } from '../supabaseClient'

const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum",
  "Gharbiya", "Ismailia", "Monufia", "Minya", "Qalyubia", "New Valley",
  "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta",
  "Sharkia", "South Sinai", "Kafr El Sheikh", "Matrouh", "Luxor",
  "Qena", "North Sinai", "Sohag"
]

const OrderModal = ({ isOpen, onClose, product }) => {
  const [customerName, setCustomerName] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [customText, setCustomText] = useState('')
  const [bgColor, setBgColor] = useState('')
  const [notes, setNotes] = useState('')

  const [availableAddons, setAvailableAddons] = useState([])
  const [loadingAddons, setLoadingAddons] = useState(false)
  const [selections, setSelections] = useState({})

  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isOpen && product) {
      fetchAddons()
      setSelections({})
      setSelectedFile(null)
      setCustomText('')
      setBgColor('')
      setGovernorate('')
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
      if (addon.operation_type === 'fixed') finalTotal += Number(addon.value)
      else if (addon.operation_type === 'percent_add') {
        const surcharge = basePrice * (Number(addon.value) / 100)
        finalTotal += surcharge
      }
    })
    return Math.ceil(finalTotal)
  }

  const finalPrice = calculateTotal()

  const uploadImage = async (file) => {
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('client-uploads')
            .upload(filePath, file)

        if (uploadError) throw uploadError

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
    if (!governorate) { alert('Please select your governorate'); return }

    if (selectedFile) setIsUploading(true)

    // 1. رفع الصورة
    let uploadedImageUrl = ''
    if (selectedFile) {
        uploadedImageUrl = await uploadImage(selectedFile)
        if (!uploadedImageUrl) {
            setIsUploading(false)
            return
        }
    }

    // 2. 🆕 تسجيل المبيعات (عشان Top Sellers يشتغل)
    try {
        const { error } = await supabase
            .rpc('increment_sold_count', { product_id: product.id })
        if (error) console.error('Error updating sales count:', error)
    } catch (err) {
        console.error('Failed to increment sales:', err)
    }

    // 3. تجهيز رسالة الواتساب
    let detailsString = `\n--- 📋 Order Details ---\n`
    detailsString += `📍 Location: ${governorate}\n`
    
    if (customText) detailsString += `✍️ Text/Date: "${customText}"\n`
    if (bgColor) detailsString += `🎨 Bg Color: ${bgColor}\n`

    const selectedList = Object.values(selections)
    if (selectedList.length === 0) detailsString += `• Base Item Only\n`

    selectedList.forEach(addon => {
      let costText = ''
      if (addon.operation_type === 'fixed') costText = `(+${addon.value})`
      else if (addon.operation_type === 'percent_add') costText = `(+${addon.value}%)`
      else if (addon.operation_type === 'percent_double_discount') costText = `(${addon.value}% OFF)`
      detailsString += `• ${addon.title} ${costText}\n`
    })

    if (uploadedImageUrl) detailsString += `\n🖼️ Ref Image: ${uploadedImageUrl}\n`

    detailsString += `\n💵 Final Price: ${finalPrice} EGP`
    detailsString += `\n⚠️ Client aware of: 10-14 days delivery & 50% Wallet Deposit (No Instapay).`
    
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
               
               {/* 1. Addons */}
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

               {/* 2. Image Upload */}
               <div>
                 <label className="block text-sm font-medium text-text mb-2">Upload Reference Image (Optional)</label>
                 <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}>
                    <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {selectedFile ? (
                            <> <ImagePlus className="text-primary" size={32} /> <span className="text-sm text-primary font-semibold">{selectedFile.name}</span> </>
                        ) : (
                            <> <Upload className="text-gray-400" size={32} /> <span className="text-sm text-gray-600">Click to upload image</span> </>
                        )}
                    </label>
                 </div>
               </div>

               <hr className="border-gray-100" />

               {/* 3. Customization Fields */}
               <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                        <Type size={16} /> Quote / Date on Item
                    </label>
                    <input 
                        type="text" 
                        value={customText}
                        onChange={e => setCustomText(e.target.value)}
                        placeholder="E.g., 12/5/2025 or 'Happy Birthday'"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                        <Palette size={16} /> Background Color
                    </label>
                    <input 
                        type="text" 
                        value={bgColor}
                        onChange={e => setBgColor(e.target.value)}
                        placeholder="E.g., Navy Blue, Black, Pastel Pink..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
               </div>

               <hr className="border-gray-100" />

               {/* 4. Location & Name */}
               <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-text mb-2">Your Name *</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg" placeholder="Full Name" required />
                 </div>
                 
                 <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                        <MapPin size={16} /> Governorate *
                    </label>
                    <select 
                        value={governorate} 
                        onChange={e => setGovernorate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white"
                        required
                    >
                        <option value="">Select Governorate</option>
                        {GOVERNORATES.map(gov => (
                            <option key={gov} value={gov}>{gov}</option>
                        ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-text mb-2">Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none" placeholder="Any extra instructions..." />
                 </div>
               </div>

               {/* 5. Important Notices Box */}
               <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <AlertCircle className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-800">Delivery Time</h4>
                            <p className="text-xs text-blue-700 mt-1">Order takes <span className="font-bold">10 to 14 days</span> to be ready.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-blue-200 pt-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Wallet className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-800">Payment Policy</h4>
                            <p className="text-xs text-blue-700 mt-1">
                                <span className="font-bold">50% Deposit</span> required via Wallet on same WhatsApp number.
                            </p>
                            <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">
                                🚫 No Instapay
                            </p>
                        </div>
                    </div>
               </div>
               
               <button 
                type="submit" 
                disabled={isUploading}
                className={`w-full bg-accent text-text font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transition-all ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
               >
                 {isUploading ? <><Loader2 className="animate-spin" size={20} /> Uploading...</> : <><Send size={20} /> Agree & Send via WhatsApp</>}
               </button>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default OrderModal