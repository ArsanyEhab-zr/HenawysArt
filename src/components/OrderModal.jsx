import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Send, Loader2, ImagePlus, MapPin, Palette, Type, AlertCircle, Wallet, Home, Navigation, Check, Truck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { openWhatsAppChat } from '../utils/whatsapp'
import { supabase } from '../supabaseClient'

// 1. قائمة المحافظات
const GOVERNORATES_LIST = [
  "Cairo", "Giza",
  "Alexandria (Center)", "Alexandria (Agami)", "Alexandria (Borg El Arab)",
  "Dakahlia", "Beheira", "Fayoum", "Gharbiya", "Ismailia", "Monufia",
  "Minya", "Qalyubia", "New Valley", "Suez", "Aswan", "Assiut",
  "Beni Suef", "Port Said", "Damietta", "Sharkia", "South Sinai",
  "Kafr El Sheikh", "Matrouh", "Luxor", "Qena", "North Sinai", "Sohag", "Red Sea"
]

// 2. دالة حساب الشحن
const getShippingFee = (gov) => {
  if (!gov) return 0
  if (gov === "Alexandria (Center)") return 50
  if (gov === "Alexandria (Agami)") return 55
  if (gov === "Alexandria (Borg El Arab)") return 60
  if (gov === "Cairo" || gov === "Giza") return 80
  if (["Port Said", "Ismailia", "Suez", "Dakahlia", "Beheira", "Gharbiya", "Monufia", "Qalyubia", "Damietta", "Sharkia", "Kafr El Sheikh"].includes(gov)) return 90
  return 100
}

const OrderModal = ({ isOpen, onClose, product }) => {
  const [customerName, setCustomerName] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [address, setAddress] = useState('')
  const [customText, setCustomText] = useState('')
  const [bgColor, setBgColor] = useState('')
  const [notes, setNotes] = useState('')

  const [locationLink, setLocationLink] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [gpsError, setGpsError] = useState('') // عشان لو معرفناش نحدد المحافظة

  const [availableAddons, setAvailableAddons] = useState([])
  const [loadingAddons, setLoadingAddons] = useState(false)
  const [selections, setSelections] = useState({})

  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const shippingFee = getShippingFee(governorate)

  useEffect(() => {
    if (isOpen && product) {
      fetchAddons()
      setSelections({})
      setSelectedFile(null)
      setCustomText('')
      setBgColor('')
      setGovernorate('')
      setAddress('')
      setNotes('')
      setLocationLink('')
      setIsLocating(false)
      setGpsError('')
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

  // 👇👇👇 الذكاء الاصطناعي لتحديد المحافظة 👇👇👇
  const autoSelectGovernorate = (addressObj) => {
    if (!addressObj) return;

    // بنحول كل الكلام لحروف صغيرة عشان المقارنة
    const state = (addressObj.state || '').toLowerCase();
    const city = (addressObj.city || addressObj.town || '').toLowerCase();
    const suburb = (addressObj.suburb || addressObj.neighbourhood || '').toLowerCase();
    const county = (addressObj.county || '').toLowerCase();

    let detectedGov = '';

    // 1. حالات الإسكندرية الخاصة
    if (state.includes('alexandria') || city.includes('alexandria')) {
      if (suburb.includes('agami') || city.includes('agami') || suburb.includes('dekheila')) {
        detectedGov = "Alexandria (Agami)";
      } else if (city.includes('borg') || suburb.includes('borg')) {
        detectedGov = "Alexandria (Borg El Arab)";
      } else {
        detectedGov = "Alexandria (Center)";
      }
    }
    // 2. القاهرة والجيزة
    else if (state.includes('cairo') || city.includes('cairo')) detectedGov = "Cairo";
    else if (state.includes('giza') || city.includes('giza')) detectedGov = "Giza";

    // 3. باقي المحافظات (بحث بالكلمة المفتاحية)
    else if (state.includes('dakahlia') || city.includes('mansoura')) detectedGov = "Dakahlia";
    else if (state.includes('beheira') || city.includes('damanhur')) detectedGov = "Beheira";
    else if (state.includes('fayoum')) detectedGov = "Fayoum";
    else if (state.includes('gharbiya') || city.includes('tanta')) detectedGov = "Gharbiya";
    else if (state.includes('ismailia')) detectedGov = "Ismailia";
    else if (state.includes('monufia') || city.includes('shibin')) detectedGov = "Monufia";
    else if (state.includes('minya')) detectedGov = "Minya";
    else if (state.includes('qalyubia') || city.includes('banha') || city.includes('shoubra')) detectedGov = "Qalyubia";
    else if (state.includes('suez')) detectedGov = "Suez";
    else if (state.includes('aswan')) detectedGov = "Aswan";
    else if (state.includes('assiut')) detectedGov = "Assiut";
    else if (state.includes('beni suef')) detectedGov = "Beni Suef";
    else if (state.includes('port said')) detectedGov = "Port Said";
    else if (state.includes('damietta')) detectedGov = "Damietta";
    else if (state.includes('sharkia') || city.includes('zagazig')) detectedGov = "Sharkia";
    else if (state.includes('sinai')) detectedGov = state.includes('south') ? "South Sinai" : "North Sinai";
    else if (state.includes('kafr') || city.includes('kafr')) detectedGov = "Kafr El Sheikh";
    else if (state.includes('matrouh')) detectedGov = "Matrouh";
    else if (state.includes('luxor')) detectedGov = "Luxor";
    else if (state.includes('qena')) detectedGov = "Qena";
    else if (state.includes('sohag')) detectedGov = "Sohag";
    else if (state.includes('red sea') || city.includes('hurghada')) detectedGov = "Red Sea";

    // لو لقينا تطابق، نحدث الولاية
    if (detectedGov) {
      setGovernorate(detectedGov);
      setGpsError(''); // مسح أي خطأ قديم
    } else {
      setGpsError('Could not auto-detect city. Please select manually.');
    }
  }

  const handleGetLocation = () => {
    setIsLocating(true)
    setGpsError('') // Reset error

    if (!navigator.geolocation) {
      alert("Geolocation is not supported")
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const mapsUrl = `http://googleusercontent.com/maps.google.com/?q=${lat},${lng}`
        setLocationLink(mapsUrl)

        try {
          // طلب البيانات باللغة الإنجليزية عشان تطابق القائمة بتاعتنا
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
          const data = await response.json()

          if (data && data.display_name) {
            setAddress(data.display_name)
            // 👇 تشغيل دالة التعرف التلقائي على المحافظة
            if (data.address) {
              autoSelectGovernorate(data.address);
            }
          }
        } catch (error) {
          console.error("Could not fetch address text", error)
        }

        setIsLocating(false)
      },
      (error) => {
        console.error("Error:", error)
        alert("Could not get location. Type manually.")
        setIsLocating(false)
      }
    )
  }

  const calculateProductTotal = () => {
    if (!product) return 0
    let total = Number(product.price)
    const coupleAddon = Object.values(selections).find(a => a.operation_type === 'percent_double_discount')
    if (coupleAddon) {
      const doublePrice = total * 2
      const discountValue = doublePrice * (Number(coupleAddon.value) / 100)
      total = doublePrice - discountValue
    }
    Object.values(selections).forEach(addon => {
      if (addon.operation_type === 'percent_double_discount') return
      if (addon.operation_type === 'fixed') total += Number(addon.value)
      else if (addon.operation_type === 'percent_add') {
        const surcharge = Number(product.price) * (Number(addon.value) / 100)
        total += surcharge
      }
    })
    return Math.ceil(total)
  }

  const productPrice = calculateProductTotal()
  const grandTotal = productPrice + shippingFee

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`
      const { error: uploadError } = await supabase.storage.from('client-uploads').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('client-uploads').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) { return null }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerName.trim()) { alert('Please enter name'); return }
    if (!governorate) { alert('Please select your governorate'); return }
    if (!address.trim()) { alert('Please enter detailed address'); return }

    if (selectedFile) setIsUploading(true)

    let uploadedImageUrl = ''
    if (selectedFile) {
      uploadedImageUrl = await uploadImage(selectedFile)
      if (!uploadedImageUrl) { setIsUploading(false); return }
    }

    try {
      await supabase.rpc('increment_sold_count', { product_id: product.id })
    } catch (err) { }

    let detailsString = `\n--- 📋 Order Details ---\n`
    detailsString += `📍 Location: ${governorate}\n`
    detailsString += `🏠 Address: ${address}\n`
    if (locationLink) detailsString += `🌍 GPS Link: ${locationLink}\n`

    if (customText) detailsString += `✍️ Text/Date: "${customText}"\n`
    if (bgColor) detailsString += `🎨 Bg Color: ${bgColor}\n`

    const selectedList = Object.values(selections)
    if (selectedList.length > 0) {
      selectedList.forEach(addon => {
        detailsString += `• ${addon.title}\n`
      })
    }

    if (uploadedImageUrl) detailsString += `\n🖼️ Ref Image: ${uploadedImageUrl}\n`

    if (product.is_starting_price) {
      detailsString += `\n💵 Product Price: Starts from ${product.price} EGP (TBD)`;
    } else {
      detailsString += `\n💵 Product Price: ${productPrice} EGP`;
    }

    detailsString += `\n🚚 Shipping: ${shippingFee} EGP`;
    if (!product.is_starting_price) {
      detailsString += `\n💰 Total Required: ${grandTotal} EGP`;
    }

    detailsString += `\n⚠️ Client aware of: 10-14 days delivery & 50% Wallet Deposit.`

    openWhatsAppChat(product, customerName, notes + detailsString)
    setIsUploading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative">
              <button onClick={onClose} className="absolute top-4 right-4"><X /></button>
              <h2 className="text-2xl font-script font-bold">Customize Order</h2>

              <div className="flex flex-col mt-3">
                {product.is_starting_price ? (
                  <span className="text-xl font-bold text-accent">Agreement via WhatsApp</span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-accent">{grandTotal} <span className="text-lg">EGP</span></span>
                  </div>
                )}

                {!product.is_starting_price && (
                  <div className="text-xs text-white/80 flex items-center gap-1 mt-1">
                    <span>Item: {productPrice}</span>
                    <span>+</span>
                    <span className="flex items-center bg-white/20 px-1 rounded"><Truck size={10} className="mr-1" /> Ship: {shippingFee}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* 1. Addons */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {loadingAddons ? <Loader2 className="animate-spin mx-auto" /> : availableAddons.map(addon => {
                  const isSelected = !!selections[addon.id]
                  let priceTag = ''
                  if (addon.operation_type === 'fixed') priceTag = `+${addon.value} EGP`
                  if (addon.operation_type === 'percent_add') priceTag = `+${addon.value}%`
                  if (addon.operation_type === 'percent_double_discount') priceTag = `${addon.value}% OFF`
                  return (
                    <label key={addon.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary bg-white shadow-sm' : 'border-transparent hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <input type={addon.ui_type} checked={isSelected} onChange={() => handleToggleAddon(addon)} className="text-primary focus:ring-primary w-5 h-5" />
                        <div><p className="font-medium text-gray-800">{addon.title}</p><p className="text-xs text-primary font-bold">{priceTag}</p></div>
                      </div>
                      {addon.image_url && <img src={addon.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
                    </label>
                  )
                })}
              </div>

              {/* 2. Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Ref Image (Optional)</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-300'}`}>
                  <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    {selectedFile ? <><ImagePlus className="text-primary" /> <span className="text-sm font-semibold">{selectedFile.name}</span></> : <><Upload className="text-gray-400" /> <span className="text-sm">Click to upload</span></>}
                  </label>
                </div>
              </div>

              {/* 3. Custom Text */}
              <div className="grid grid-cols-1 gap-4">
                <input type="text" value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Quote / Date..." className="w-full px-4 py-3 border rounded-lg" />
                <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} placeholder="Background Color..." className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <hr className="border-gray-100" />

              {/* 4. Location & Name */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Your Name *</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required />
                </div>

                {/* المحافظة + زرار الـ GPS */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                    <MapPin size={16} /> Governorate (Shipping Fee) *
                  </label>
                  <select
                    value={governorate}
                    onChange={e => setGovernorate(e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg bg-white transition-all ${gpsError ? 'border-yellow-400' : ''}`}
                    required
                  >
                    <option value="">Select Governorate</option>
                    {GOVERNORATES_LIST.map(gov => (
                      <option key={gov} value={gov}>
                        {gov} {getShippingFee(gov) > 0 ? `(+${getShippingFee(gov)} EGP)` : ''}
                      </option>
                    ))}
                  </select>
                  {gpsError && <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {gpsError}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-text"><Home size={16} /> Detailed Address *</label>
                    <button type="button" onClick={handleGetLocation} disabled={isLocating} className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${locationLink ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                      {isLocating ? <><Loader2 size={12} className="animate-spin" /> Auto-Detecting City...</> : locationLink ? <><Check size={12} /> City Detected</> : <><Navigation size={12} /> Detect My City & Address</>}
                    </button>
                  </div>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-3 border rounded-lg resize-none ${locationLink ? 'border-green-500' : ''}`}
                    placeholder={locationLink ? "Please add: Floor, Apartment No..." : "Street Name, Building No, Floor..."}
                    required
                  />
                </div>

                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 border rounded-lg resize-none" placeholder="Notes..." />
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

              <button type="submit" disabled={isUploading} className={`w-full bg-accent text-text font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg ${isUploading ? 'opacity-70' : ''}`}>
                {isUploading ? <><Loader2 className="animate-spin" size={20} /> Sending...</> : <><Send size={20} /> Check out via WhatsApp</>}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default OrderModal