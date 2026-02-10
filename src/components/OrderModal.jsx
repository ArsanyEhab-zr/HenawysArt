import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Send, Loader2, ImagePlus, MapPin, Palette, Type, AlertCircle, Wallet, Home, Navigation, Check, Truck, Tag, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { openWhatsAppChat } from '../utils/whatsapp'
import { supabase } from '../supabaseClient'

// 🎨 قائمة الألوان
const COMMON_COLORS = [
  { hex: "#000000", name: "Black" }, { hex: "#FFFFFF", name: "White" }, { hex: "#808080", name: "Gray" },
  { hex: "#C0C0C0", name: "Silver" }, { hex: "#FF0000", name: "Red" }, { hex: "#800000", name: "Maroon" },
  { hex: "#FFFF00", name: "Yellow" }, { hex: "#808000", name: "Olive" }, { hex: "#00FF00", name: "Lime" },
  { hex: "#008000", name: "Green" }, { hex: "#00FFFF", name: "Aqua" }, { hex: "#008080", name: "Teal" },
  { hex: "#0000FF", name: "Blue" }, { hex: "#000080", name: "Navy Blue" }, { hex: "#FF00FF", name: "Fuchsia" },
  { hex: "#800080", name: "Purple" }, { hex: "#FFA500", name: "Orange" }, { hex: "#FFC0CB", name: "Pink" },
  { hex: "#FFD700", name: "Gold" }, { hex: "#F5F5DC", name: "Beige" }, { hex: "#A52A2A", name: "Brown" },
  { hex: "#40E0D0", name: "Turquoise" }, { hex: "#ADD8E6", name: "Light Blue" }, { hex: "#F0E68C", name: "Khaki" },
  { hex: "#E6E6FA", name: "Lavender" }
];

const getColorNameFromHex = (hex) => {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  let closestColor = "Custom Color";
  let minDistance = Infinity;
  COMMON_COLORS.forEach(color => {
    const targetR = parseInt(color.hex.substr(1, 2), 16);
    const targetG = parseInt(color.hex.substr(3, 2), 16);
    const targetB = parseInt(color.hex.substr(5, 2), 16);
    const distance = Math.sqrt(Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2));
    if (distance < minDistance) { minDistance = distance; closestColor = color.name; }
  });
  return closestColor;
};

const OrderModal = ({ isOpen, onClose, product }) => {
  // State Variables
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [shippingRatesList, setShippingRatesList] = useState([])
  const [shippingLoading, setShippingLoading] = useState(true)

  const [address, setAddress] = useState('')
  const [customText, setCustomText] = useState('')
  const [bgColor, setBgColor] = useState('')
  const [pickerHex, setPickerHex] = useState('#ffffff')
  const [notes, setNotes] = useState('')

  // Location States
  const [locationLink, setLocationLink] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [gpsError, setGpsError] = useState('')

  // Addons States
  const [availableAddons, setAvailableAddons] = useState([])
  const [loadingAddons, setLoadingAddons] = useState(false)
  const [selections, setSelections] = useState({})

  // Coupon States
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' })

  // Upload States
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const shippingFee = shippingRatesList.find(r => r.governorate === governorate)?.fee || 0

  useEffect(() => {
    if (isOpen) {
      fetchShippingRates()
      if (product) fetchAddons()
    }

    if (isOpen && product) {
      setSelections({})
      setSelectedFile(null)
      setCustomText('')
      setBgColor('')
      setPickerHex('#ffffff')
      setGovernorate('')
      setAddress('')
      setNotes('')
      setPhone('')
      setLocationLink('')
      setIsLocating(false)
      setGpsError('')
      setCouponCode('')
      setAppliedCoupon(null)
      setCouponMsg({ type: '', text: '' })
    }
  }, [product, isOpen])

  const fetchShippingRates = async () => {
    try {
      setShippingLoading(true)
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .order('governorate', { ascending: true })

      if (error) throw error
      setShippingRatesList(data || [])
    } catch (error) {
      console.error("Error fetching rates:", error)
    } finally {
      setShippingLoading(false)
    }
  }

  const fetchAddons = async () => {
    setLoadingAddons(true)
    try {
      const { data, error } = await supabase
        .from('product_addons')
        .select('*')
        .or(`category_target.eq.${product.category},category_target.eq.all`)
      if (error) throw error
      setAvailableAddons(data || [])
    } catch (error) { console.error('Error fetching addons:', error) }
    finally { setLoadingAddons(false) }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    if (!phone.trim() || phone.length < 10) {
      setCouponMsg({ type: 'error', text: 'Please enter a valid phone number first.' })
      return;
    }

    setCouponLoading(true)
    setCouponMsg({ type: '', text: '' })
    setAppliedCoupon(null)

    try {
      const { data: couponData, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim())
        .single()

      if (error || !couponData) throw new Error("Invalid coupon code")
      if (!couponData.is_active) throw new Error("This coupon is inactive")

      const now = new Date()
      if (now < new Date(couponData.start_date)) throw new Error("Coupon hasn't started yet")
      if (now > new Date(couponData.end_date)) throw new Error("Coupon has expired")

      if (couponData.usage_limit && couponData.used_count >= couponData.usage_limit) {
        throw new Error("This coupon has reached its usage limit.")
      }

      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('phone', phone.trim())
        .eq('items->>coupon', couponCode.trim())

      if (count > 0) {
        throw new Error("You have already used this coupon code!")
      }

      setAppliedCoupon(couponData)
      setCouponMsg({ type: 'success', text: `Coupon applied! (${couponData.discount_type === 'percent' ? couponData.discount_value + '%' : couponData.discount_value + ' EGP'} OFF)` })
    } catch (err) {
      setCouponMsg({ type: 'error', text: err.message || "Invalid Code" })
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleToggleAddon = (addon) => {
    setSelections(prev => {
      const newSelections = { ...prev }
      if (addon.ui_type === 'checkbox') {
        if (newSelections[addon.id]) delete newSelections[addon.id]
        else newSelections[addon.id] = addon

      } else if (addon.ui_type === 'radio') {
        if (newSelections[addon.id]) {
          delete newSelections[addon.id]
        } else {
          Object.values(newSelections).forEach(selected => {
            if (selected.ui_type === 'radio') {
              delete newSelections[selected.id]
            }
          })
          newSelections[addon.id] = addon
        }
      }
      return newSelections
    })
  }

  const autoSelectGovernorate = (addressData) => {
    if (!addressData || shippingRatesList.length === 0) return;

    const fullText = (addressData.display_name || '').toLowerCase();
    let detectedGov = '';

    if (fullText.includes('alexandria') || fullText.includes('الإسكندرية')) {
      if (fullText.includes('agami') || fullText.includes('العجمي') || fullText.includes('hannoville')) {
        const match = shippingRatesList.find(r => r.governorate.toLowerCase().includes('agami'));
        if (match) detectedGov = match.governorate;
      }
      else if (fullText.includes('borg') || fullText.includes('burj') || fullText.includes('برج العرب')) {
        const match = shippingRatesList.find(r => r.governorate.toLowerCase().includes('borg'));
        if (match) detectedGov = match.governorate;
      }

      if (!detectedGov) {
        const centerMatch = shippingRatesList.find(r => r.governorate.toLowerCase().includes('center') && r.governorate.toLowerCase().includes('alexandria'));
        if (centerMatch) {
          detectedGov = centerMatch.governorate;
        } else {
          const fallbackMatch = shippingRatesList.find(r => r.governorate.toLowerCase().includes('alexandria'));
          if (fallbackMatch) detectedGov = fallbackMatch.governorate;
        }
      }
    }
    else {
      const foundRate = shippingRatesList.find(rate => {
        const cleanName = rate.governorate.toLowerCase().replace('governorate', '').trim();
        return fullText.includes(cleanName);
      });
      if (foundRate) detectedGov = foundRate.governorate;
    }

    if (detectedGov) {
      setGovernorate(detectedGov);
      setGpsError('');
    } else {
      setGpsError('Detected address, but could not match city automatically.');
    }
  }

  const handleGetLocation = () => {
    setIsLocating(true)
    setGpsError('')
    if (!navigator.geolocation) { alert("Geolocation is not supported"); setIsLocating(false); return; }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const mapsUrl = `http://googleusercontent.com/maps.google.com/?q=${lat},${lng}`
        setLocationLink(mapsUrl)

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
          const data = await response.json()

          if (data && data.display_name) {
            setAddress(data.display_name)
            autoSelectGovernorate(data);
          }
        } catch (error) {
          console.error("Could not fetch address text", error)
        }
        setIsLocating(false)
      },
      (error) => {
        console.error("Error:", error);
        alert("Could not get location.");
        setIsLocating(false);
      }
    )
  }

  const calculateTotals = () => {
    if (!product) return { productTotalBeforeDiscount: 0, discountAmount: 0, finalProductPrice: 0, grandTotal: 0 }

    let productTotal = Number(product.price)

    const coupleAddon = Object.values(selections).find(a => a.operation_type === 'percent_double_discount')
    if (coupleAddon) {
      const doublePrice = productTotal * 2
      const discountVal = doublePrice * (Number(coupleAddon.value) / 100)
      productTotal = doublePrice - discountVal
    }
    Object.values(selections).forEach(addon => {
      if (addon.operation_type === 'percent_double_discount') return
      if (addon.operation_type === 'fixed') productTotal += Number(addon.value)
      else if (addon.operation_type === 'percent_add') {
        productTotal += Number(product.price) * (Number(addon.value) / 100)
      }
    })

    let discountAmount = 0
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === 'fixed') {
        discountAmount = Number(appliedCoupon.discount_value)
      } else if (appliedCoupon.discount_type === 'percent') {
        discountAmount = productTotal * (Number(appliedCoupon.discount_value) / 100)
      }
    }
    if (discountAmount > productTotal) discountAmount = productTotal

    const finalProductPrice = Math.ceil(productTotal - discountAmount)
    const grandTotal = finalProductPrice + shippingFee

    return {
      productTotalBeforeDiscount: Math.ceil(productTotal),
      discountAmount: Math.ceil(discountAmount),
      finalProductPrice,
      grandTotal
    }
  }

  const { productTotalBeforeDiscount, discountAmount, finalProductPrice, grandTotal } = calculateTotals()

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
    if (!phone.trim()) { alert('Please enter phone number'); return }
    if (!governorate) { alert('Please use the "Detect My City" button to select your location'); return }
    if (!address.trim()) { alert('Please enter detailed address'); return }

    if (selectedFile) setIsUploading(true)

    let uploadedImageUrl = ''
    if (selectedFile) {
      uploadedImageUrl = await uploadImage(selectedFile)
      if (!uploadedImageUrl) { setIsUploading(false); return }
    }

    try {
      const { error: orderError } = await supabase.from('orders').insert([{
        customer_name: customerName,
        phone: phone,
        governorate: governorate,
        address: address,
        total_price: grandTotal,
        shipping_fee: shippingFee,
        status: 'pending',
        items: {
          productId: product.id,
          productName: product.title,
          addons: selections,
          customText: customText,
          bgColor: bgColor,
          coupon: appliedCoupon ? appliedCoupon.code : null,
          refImage: uploadedImageUrl
        },
        notes: notes
      }])

      if (orderError) console.error("Dashboard insert failed", orderError)

      await supabase.rpc('increment_sold_count', { product_id: product.id })

      if (appliedCoupon) {
        await supabase.rpc('increment_coupon_usage', { coupon_code: appliedCoupon.code })
      }
    } catch (err) {
      console.error(err)
    }

    let detailsString = `\n--- 📋 Order Details ---\n`
    detailsString += `👤 Customer: ${customerName}\n`
    detailsString += `📱 Phone: ${phone}\n`
    detailsString += `📍 Location: ${governorate}\n`
    detailsString += `🏠 Address: ${address}\n`
    if (locationLink) detailsString += `🌍 GPS Link: ${locationLink}\n`

    if (customText) detailsString += `✍️ Text/Date: "${customText}"\n`
    if (bgColor) detailsString += `🎨 Bg Color: ${bgColor}\n`

    const selectedList = Object.values(selections)
    if (selectedList.length > 0) {
      selectedList.forEach(addon => { detailsString += `• ${addon.title}\n` })
    }

    if (uploadedImageUrl) detailsString += `\n🖼️ Ref Image: ${uploadedImageUrl}\n`

    if (product.is_starting_price) {
      detailsString += `\n💵 Price: Starts from ${product.price} EGP (TBD)`;
    } else {
      detailsString += `\n💵 Item Price: ${productTotalBeforeDiscount} EGP`;
      if (appliedCoupon) {
        detailsString += `\n🎟️ Coupon (${appliedCoupon.code}): -${discountAmount} EGP`;
        detailsString += `\n📉 Price after discount: ${finalProductPrice} EGP`;
      }
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            // 👇 هنا التعديل: إخفاء السكرول بار باستخدام كلاس خاص وتكبير العرض شوية
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >

            {/* Header Sticky - ثابت في الأعلى */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-primary to-primary-dark p-6 text-white shadow-lg backdrop-blur-md">
              <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 p-1 rounded-full hover:bg-white/40 transition-all"><X size={20} /></button>
              <h2 className="text-xl md:text-2xl font-script font-bold">Customize Order</h2>

              <div className="flex flex-col mt-2">
                {product.is_starting_price ? (
                  <span className="text-lg font-bold text-accent">Discussion via WhatsApp</span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-accent drop-shadow-sm">{grandTotal} <span className="text-lg">EGP</span></span>
                    {appliedCoupon && <span className="text-sm text-white/70 line-through">{grandTotal + discountAmount} EGP</span>}
                  </div>
                )}
                {!product.is_starting_price && (
                  <div className="text-xs text-white/90 flex flex-wrap items-center gap-2 mt-1 font-medium">
                    <span className="bg-white/10 px-2 py-0.5 rounded">Item: {finalProductPrice}</span>
                    <span>+</span>
                    <span className="flex items-center bg-white/20 px-2 py-0.5 rounded"><Truck size={10} className="mr-1" /> Ship: {shippingFee}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Addons Grid - شكل الكروت الجديد */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Palette size={16} className="text-primary" /> Customizations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {loadingAddons ? <div className="col-span-full py-4 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div> : availableAddons.map(addon => {
                    const isSelected = !!selections[addon.id]
                    let priceTag = ''
                    if (addon.operation_type === 'fixed') priceTag = `+${addon.value} EGP`
                    if (addon.operation_type === 'percent_add') priceTag = `+${addon.value}%`
                    if (addon.operation_type === 'percent_double_discount') priceTag = `${addon.value}% OFF`

                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon)}
                        className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group
                                ${isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-gray-100 hover:border-primary/50 hover:shadow-md bg-white'
                          }`}
                      >
                        {/* Checkbox Icon */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300 group-hover:border-primary/50'}`}>
                          {isSelected && <Check size={12} strokeWidth={4} />}
                        </div>

                        <div className="flex-1">
                          <p className={`font-bold text-sm ${isSelected ? 'text-primary-dark' : 'text-gray-700'}`}>{addon.title}</p>
                          <p className="text-xs text-primary font-bold mt-0.5">{priceTag}</p>
                        </div>
                        {addon.image_url && <img src={addon.image_url} alt="" className="w-10 h-10 rounded-md object-cover border border-gray-100" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Image Upload - تصميم جديد */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reference Image (Optional)</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-gray-50 
                    ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/40'}`}>
                  <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    {selectedFile ? (
                      <>
                        <div className="bg-primary/10 p-3 rounded-full text-primary"><ImagePlus size={24} /></div>
                        <span className="text-sm font-semibold text-primary">{selectedFile.name}</span>
                        <span className="text-xs text-gray-400">Click to change</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-100 p-3 rounded-full text-gray-500"><Upload size={24} /></div>
                        <span className="text-sm font-medium text-gray-600">Click to upload your photo</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Text & Color */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Type size={16} className="text-primary" /> Text on Item</label>
                  <input type="text" value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Name, Date, or Quote..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Palette size={16} className="text-primary" /> Background Color</label>
                  <div className="flex gap-2">
                    <div className="relative overflow-hidden w-14 h-[50px] rounded-xl border border-gray-200 shadow-sm shrink-0 cursor-pointer hover:shadow-md transition-shadow">
                      <input type="color" value={pickerHex} onChange={e => { const hex = e.target.value; setPickerHex(hex); setBgColor(getColorNameFromHex(hex)); }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer" />
                    </div>
                    <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} placeholder="Pick or type color..." className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Phone Section - مفصول لوحده لضمان الظهور */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Phone size={16} className="text-primary" /> Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                  required
                />
              </div>

              {/* Coupon Section - مفصول لوحده */}
              {!product.is_starting_price && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Tag size={16} className="text-primary" /> Coupon Code
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="SAVE10"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl uppercase font-medium bg-white outline-none focus:border-primary"
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ?
                      <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponMsg({ type: '', text: '' }) }} className="w-full sm:w-auto bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm">Remove</button> :
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode} className="w-full sm:w-auto bg-gray-800 text-white px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors">
                        {couponLoading ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                      </button>
                    }
                  </div>
                  {couponMsg.text && <p className={`text-xs mt-2 font-bold flex items-center gap-1 ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{couponMsg.text}</p>}
                </div>
              )}

              {/* Address Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" required />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <MapPin size={16} className="text-primary" /> Governorate <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={governorate}
                      onChange={e => setGovernorate(e.target.value)}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 appearance-none cursor-pointer outline-none focus:border-primary ${gpsError ? 'border-yellow-400' : ''}`}
                      required
                      disabled={true}
                    >
                      <option value="">{shippingLoading ? "Loading rates..." : "Detected automatically below 👇"}</option>
                      {shippingRatesList.map(rate => (
                        <option key={rate.id} value={rate.governorate}>
                          {rate.governorate} (+{rate.fee} EGP)
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                  {gpsError && <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {gpsError}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700"><Home size={16} className="text-primary" /> Address <span className="text-red-500">*</span></label>
                    <button type="button" onClick={handleGetLocation} disabled={isLocating} className={`text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all shadow-sm ${locationLink ? 'bg-green-100 text-green-700' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                      {isLocating ? <><Loader2 size={12} className="animate-spin" /> Detecting...</> : locationLink ? <><Check size={12} /> Detected</> : <><Navigation size={12} /> Detect My Location</>}
                    </button>
                  </div>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className={`w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-primary/20 outline-none ${locationLink ? 'border-green-500 bg-green-50/30' : 'border-gray-200'}`} placeholder={locationLink ? "Please add: Floor, Apartment No..." : "Street Name, Building No, Floor..."} required />
                </div>

                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Any special notes..." />
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Delivery Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={16} className="text-blue-600" />
                    <span className="text-xs font-bold text-blue-800 uppercase">Delivery Time</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Order takes <span className="font-bold">10 to 14 days</span> to be ready.
                  </p>
                </div>

                {/* Payment Card */}
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet size={16} className="text-purple-600" />
                    <span className="text-xs font-bold text-purple-800 uppercase">Payment Policy</span>
                  </div>
                  <p className="text-xs text-purple-700 font-medium">50% Deposit via Wallet.</p>
                  {/* 👇 رجعتلك التحذير هنا 👇 */}
                  <p className="text-[10px] text-red-500 font-bold mt-1 uppercase flex items-center gap-1">
                    🚫 No Instapay
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isUploading} className={`w-full bg-accent hover:bg-yellow-400 text-gray-900 font-bold py-4 rounded-xl flex justify-center items-center gap-3 shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] ${isUploading ? 'opacity-70 cursor-wait' : ''}`}>
                {isUploading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : <><Send size={20} /> Checkout on WhatsApp</>}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default OrderModal